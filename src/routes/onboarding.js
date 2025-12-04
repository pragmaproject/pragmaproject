const express = require('express');
const crypto = require('crypto');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const supabase = require('../lib/supabase');
const router = express.Router();

// 1. REGISTRAZIONE INIZIALE
router.post('/register', async (req, res) => {
    try {
        const { name, email, plan } = req.body;

        if (!name || !email) return res.status(400).json({ error: "Dati mancanti." });

        // Controllo duplicati
        const { data: existingUser } = await supabase.from('clients').select('id').eq('email', email).single();
        if (existingUser) return res.status(409).json({ error: "Email già registrata." });

        const clientId = `cust_${crypto.randomBytes(8).toString('hex')}`;
        
        // Se è Starter: Genera subito la chiave (è gratis)
        // Se è Enterprise: NON generare la chiave ora
        let apiKey = null;
        let initialStatus = 'Attivo';

        if (plan === 'Starter') {
            apiKey = `pk_live_${crypto.randomBytes(24).toString('hex')}`;
            // Salviamo subito la chiave per Starter
            await supabase.from('api_keys').insert([{
                key_id: apiKey, client_id: clientId, name: 'Default Key', type: 'Live', status: 'Attiva'
            }]);
        } else {
            initialStatus = 'In Attesa'; // Enterprise nasce sospeso
        }

        // Salviamo il Cliente (Senza chiave se Enterprise)
        const { error: clientError } = await supabase.from('clients').insert([{
            id: clientId, name: name, email: email, plan: plan, status: initialStatus, usage_count: 0
        }]);
        if (clientError) throw clientError;

        // Gestione Stripe (Solo Enterprise)
        let checkoutUrl = null;
        if (plan === 'Enterprise') {
            const customer = await stripe.customers.create({
                email: email, name: name, metadata: { supabase_client_id: clientId }
            });

            await supabase.from('clients').update({ stripe_customer_id: customer.id }).eq('id', clientId);

            const session = await stripe.checkout.sessions.create({
                customer: customer.id,
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
                // RIMANDIAMO A UNA PAGINA SPECIALE DI SUCCESSO
                success_url: `${process.env.FRONTEND_URL.replace('index.html', 'success.html')}?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL.replace('index.html', 'signup.html')}`,
            });
            checkoutUrl = session.url;
        }

        res.json({
            success: true,
            apiKey: apiKey, // Sarà null per Enterprise
            redirectUrl: checkoutUrl
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. FINALIZZAZIONE (Chiamata dalla pagina di successo dopo il pagamento)
router.get('/finalize', async (req, res) => {
    try {
        const { session_id } = req.query;
        if (!session_id) return res.status(400).json({ error: "Session ID mancante" });

        // Verifichiamo su Stripe che abbia pagato davvero
        const session = await stripe.checkout.sessions.retrieve(session_id);
        
        if (session.payment_status !== 'paid') {
            return res.status(402).json({ error: "Pagamento non completato." });
        }

        // Recuperiamo il cliente dal DB usando l'ID Stripe
        const customerId = session.customer;
        const { data: client } = await supabase.from('clients').select('id, email').eq('stripe_customer_id', customerId).single();

        if (!client) return res.status(404).json({ error: "Cliente non trovato." });

        // CONTROLLO: Ha già una chiave? (Per evitare di crearne 2 se ricarica la pagina)
        const { data: existingKey } = await supabase.from('api_keys').select('key_id').eq('client_id', client.id).single();
        
        if (existingKey) {
            return res.json({ apiKey: existingKey.key_id, email: client.email });
        }

        // GENERAZIONE CHIAVE (Solo ora che ha pagato!)
        const newApiKey = `pk_live_${crypto.randomBytes(24).toString('hex')}`;
        
        await supabase.from('api_keys').insert([{
            key_id: newApiKey, client_id: client.id, name: 'Enterprise Key', type: 'Live', status: 'Attiva'
        }]);

        // Attiviamo anche il cliente per sicurezza
        await supabase.from('clients').update({ status: 'Attivo', plan: 'Enterprise' }).eq('id', client.id);

        res.json({ apiKey: newApiKey, email: client.email });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;