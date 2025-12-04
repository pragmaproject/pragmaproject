const express = require('express');
const crypto = require('crypto');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const supabase = require('../lib/supabase');
const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { name, email, plan } = req.body;

        if (!name || !email) return res.status(400).json({ error: "Dati mancanti." });

        // 1. Controllo Intelligente (Smart Check)
        let clientId = null;
        
        const { data: existingUser } = await supabase
            .from('clients')
            .select('id, status, plan')
            .eq('email', email)
            .single();

        if (existingUser) {
            // CASO A: È già un cliente attivo -> ERRORE (Giusto)
            if (existingUser.status === 'Attivo') {
                return res.status(409).json({ error: "Email già registrata. Usa il Login." });
            }
            
            // CASO B: È un cliente "In Attesa" (ha fallito il pagamento prima) -> RECUPERO
            // Riutilizziamo il suo ID e lo facciamo riprovare a pagare
            console.log(`♻️ Recupero utente in attesa: ${existingUser.id}`);
            clientId = existingUser.id;
            
            // Aggiorniamo eventuali dati nuovi
            await supabase.from('clients').update({ name: name, plan: plan }).eq('id', clientId);

        } else {
            // CASO C: Nuovo Utente -> CREAZIONE
            clientId = `cust_${crypto.randomBytes(8).toString('hex')}`;
            const initialStatus = plan === 'Enterprise' ? 'In Attesa' : 'Attivo';
            
            const { error: clientError } = await supabase.from('clients').insert([{
                id: clientId, name: name, email: email, plan: plan, status: initialStatus, usage_count: 0
            }]);
            if (clientError) throw clientError;
        }

        // 2. Logica Chiavi (Starter vs Enterprise)
        let apiKey = null;
        let checkoutUrl = null;

        if (plan === 'Starter') {
            // Se è Starter (o era in attesa e ora vuole Starter), diamogli la chiave
            apiKey = `pk_live_${crypto.randomBytes(24).toString('hex')}`;
            
            // Controllo se ha già una chiave (caso recupero)
            const { data: existingKey } = await supabase.from('api_keys').select('key_id').eq('client_id', clientId).single();
            
            if (existingKey) {
                apiKey = existingKey.key_id; // Ridagli la vecchia se c'è
            } else {
                await supabase.from('api_keys').insert([{
                    key_id: apiKey, client_id: clientId, name: 'Default Key', type: 'Live', status: 'Attiva'
                }]);
            }
            
            // Se stiamo recuperando un utente "In Attesa" che ora sceglie "Starter", attiviamolo!
            if (existingUser && existingUser.status !== 'Attivo') {
                await supabase.from('clients').update({ status: 'Attivo' }).eq('id', clientId);
            }

        } else {
            // PLAN ENTERPRISE (Pagamento)
            // Se è Enterprise, NON generiamo la chiave ora. Mandiamo su Stripe.
            
            // Creiamo/Recuperiamo customer su Stripe
            let stripeCustomerId = null;
            
            // Cerchiamo se ha già un ID Stripe nel DB
            const { data: clientData } = await supabase.from('clients').select('stripe_customer_id').eq('id', clientId).single();
            
            if (clientData?.stripe_customer_id) {
                stripeCustomerId = clientData.stripe_customer_id;
            } else {
                const customer = await stripe.customers.create({
                    email: email, name: name, metadata: { supabase_client_id: clientId }
                });
                stripeCustomerId = customer.id;
                await supabase.from('clients').update({ stripe_customer_id: customer.id }).eq('id', clientId);
            }

            const session = await stripe.checkout.sessions.create({
                customer: stripeCustomerId,
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'usd',
                        product_data: { name: 'Pragma Enterprise Plan' },
                        unit_amount: 49900,
                        recurring: { interval: 'month' },
                    },
                    quantity: 1,
                }],
                mode: 'subscription',
                success_url: `${process.env.FRONTEND_URL.replace('index.html', 'success.html')}?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL.replace('index.html', 'signup.html')}`,
            });
            checkoutUrl = session.url;
        }

        res.json({
            success: true,
            apiKey: apiKey,
            clientId: clientId,
            redirectUrl: checkoutUrl
        });

    } catch (err) {
        console.error("Onboarding Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Finalize rimane uguale...
router.get('/finalize', async (req, res) => {
    try {
        const { session_id } = req.query;
        if (!session_id) return res.status(400).json({ error: "Session ID mancante" });

        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (session.payment_status !== 'paid') return res.status(402).json({ error: "Pagamento non completato." });

        const customerId = session.customer;
        const { data: client } = await supabase.from('clients').select('id, email').eq('stripe_customer_id', customerId).single();

        if (!client) return res.status(404).json({ error: "Cliente non trovato." });

        const { data: existingKey } = await supabase.from('api_keys').select('key_id').eq('client_id', client.id).single();
        if (existingKey) return res.json({ apiKey: existingKey.key_id, email: client.email });

        const newApiKey = `pk_live_${crypto.randomBytes(24).toString('hex')}`;
        await supabase.from('api_keys').insert([{ key_id: newApiKey, client_id: client.id, name: 'Enterprise Key', type: 'Live', status: 'Attiva' }]);
        await supabase.from('clients').update({ status: 'Attivo', plan: 'Enterprise' }).eq('id', client.id);

        res.json({ apiKey: newApiKey, email: client.email });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;