const express = require('express');
const crypto = require('crypto');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const supabase = require('../lib/supabase');
const router = express.Router();

// 1. REGISTRAZIONE
router.post('/register', async (req, res) => {
    try {
        const { name, email, plan } = req.body;

        if (!name || !email) return res.status(400).json({ error: "Dati mancanti." });

        // Controllo se esiste già un cliente ATTIVO
        const { data: existingUser } = await supabase
            .from('clients')
            .select('id, status')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(409).json({ error: "Email già registrata e attiva." });
        }

        // CASO A: STARTER (Gratis) -> Creiamo subito
        if (plan === 'Starter') {
            const clientId = `cust_${crypto.randomBytes(8).toString('hex')}`;
            const apiKey = `pk_live_${crypto.randomBytes(24).toString('hex')}`;

            await supabase.from('clients').insert([{
                id: clientId, name: name, email: email, plan: 'Starter', status: 'Attivo', usage_count: 0
            }]);

            await supabase.from('api_keys').insert([{
                key_id: apiKey, client_id: clientId, name: 'Default Key', type: 'Live', status: 'Attiva'
            }]);

            return res.json({ success: true, apiKey: apiKey });
        }

        // CASO B: ENTERPRISE (A Pagamento) -> NON SALVIAMO NULLA NEL DB
        // Passiamo i dati a Stripe nei metadata. Se non paga, noi non sappiamo nulla.
        if (plan === 'Enterprise') {
            
            // Generiamo un ID temporaneo solo per Stripe, ma non lo salviamo ancora
            const tempClientId = `cust_${crypto.randomBytes(8).toString('hex')}`;

            const session = await stripe.checkout.sessions.create({
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
                // 🔥 QUI NASCONDIAMO I DATI UTENTE 🔥
                metadata: {
                    pragma_name: name,
                    pragma_email: email,
                    pragma_client_id: tempClientId
                },
                success_url: `${process.env.FRONTEND_URL.replace('index.html', 'success.html')}?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL.replace('index.html', 'signup.html')}`,
            });

            // Restituiamo solo l'URL. Nel nostro DB non c'è traccia di questo utente.
            return res.json({ success: true, redirectUrl: session.url });
        }

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. FINALIZZAZIONE (Creazione Account POST-PAGAMENTO)
router.get('/finalize', async (req, res) => {
    try {
        const { session_id } = req.query;
        if (!session_id) return res.status(400).json({ error: "Session ID mancante" });

        // Recuperiamo la sessione da Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id);
        
        if (session.payment_status !== 'paid') {
            return res.status(402).json({ error: "Pagamento non completato." });
        }

        // 🔥 RECUPERIAMO I DATI DALLA BUSTA DI STRIPE 🔥
        const { pragma_name, pragma_email, pragma_client_id } = session.metadata;

        // Controllo di sicurezza: L'abbiamo già creato? (Se l'utente ricarica la pagina)
        const { data: existingClient } = await supabase.from('clients').select('id').eq('email', pragma_email).single();
        
        let clientId = existingClient ? existingClient.id : pragma_client_id;
        let apiKey = null;

        if (!existingClient) {
            // È LA PRIMA VOLTA -> CREIAMO ORA IL CLIENTE NEL DB
            await supabase.from('clients').insert([{
                id: clientId,
                name: pragma_name,
                email: pragma_email,
                plan: 'Enterprise',
                status: 'Attivo', // Nasce direttamente attivo!
                usage_count: 0,
                stripe_customer_id: session.customer,
                stripe_subscription_id: session.subscription
            }]);
        }

        // Recuperiamo o Creiamo la chiave
        const { data: existingKey } = await supabase.from('api_keys').select('key_id').eq('client_id', clientId).single();
        
        if (existingKey) {
            apiKey = existingKey.key_id;
        } else {
            apiKey = `pk_live_${crypto.randomBytes(24).toString('hex')}`;
            await supabase.from('api_keys').insert([{
                key_id: apiKey, client_id: clientId, name: 'Enterprise Key', type: 'Live', status: 'Attiva'
            }]);
        }

        res.json({ apiKey: apiKey, email: pragma_email });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;