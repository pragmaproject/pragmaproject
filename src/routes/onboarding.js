const express = require('express');
const crypto = require('crypto');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const supabase = require('../lib/supabase');
const PLANS = require('../config/plans'); // Ensure this file exists and has correct Price IDs
const router = express.Router();

// 1. REGISTRAZIONE
router.post('/register', async (req, res) => {
    try {
        const { name, email, plan } = req.body;

        if (!name || !email || !plan) return res.status(400).json({ error: "Dati mancanti." });
        
        // Validate Plan
        if (!PLANS[plan]) return res.status(400).json({ error: "Piano non valido." });

        // Check for existing ACTIVE user
        const { data: existingUser } = await supabase
            .from('clients')
            .select('id, status')
            .eq('email', email)
            .single();

        if (existingUser) {
            // If active, block registration
            if (existingUser.status === 'Attivo') {
                return res.status(409).json({ error: "Email già registrata e attiva." });
            }
            // If "In Attesa", we can proceed to recovery/re-subscription logic below
        }

        // CASO A: PIANO GRATUITO (Developer) -> Creazione Immediata
        if (plan === 'Developer') {
            const clientId = `cust_${crypto.randomBytes(8).toString('hex')}`;
            const apiKey = `pk_live_${crypto.randomBytes(24).toString('hex')}`;

            // Create Client
            const { error: clientError } = await supabase.from('clients').insert([{
                id: clientId, name: name, email: email, plan: 'Developer', status: 'Attivo', usage_count: 0
            }]);
            if (clientError) throw clientError;

            // Create Key
            await supabase.from('api_keys').insert([{
                key_id: apiKey, client_id: clientId, name: 'Default Key', status: 'Attiva'
            }]);

            return res.json({ success: true, apiKey: apiKey });
        }

        // CASO B: PIANI A PAGAMENTO (Startup, Scale, Enterprise) -> Stripe Checkout
        // Zero-Data: No DB insert here. Data goes to Stripe Metadata.
        if (PLANS[plan].priceId || plan === 'Enterprise') {
            
            // Generate a temp ID for reference (will be used as actual ID later)
            const tempClientId = `cust_${crypto.randomBytes(8).toString('hex')}`;

            // Costruiamo l'URL base pulito per i redirect
            // Rimuove eventuali /index.html finali o slash extra
            const baseUrl = process.env.FRONTEND_URL.replace(/\/index\.html$/, '').replace(/\/$/, '');

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price: PLANS[plan].priceId,
                    quantity: 1,
                }],
                mode: 'subscription',
                // Store user data in metadata to retrieve after payment
                metadata: {
                    pragma_name: name,
                    pragma_email: email,
                    pragma_client_id: tempClientId,
                    pragma_plan: plan
                },
                success_url: `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${baseUrl}/signup.html`,
            });

            return res.json({ success: true, redirectUrl: session.url });
        }

    } catch (err) {
        console.error("Onboarding Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// 2. FINALIZZAZIONE (Post-Pagamento)
router.get('/finalize', async (req, res) => {
    try {
        const { session_id } = req.query;
        if (!session_id) return res.status(400).json({ error: "Session ID mancante" });

        // Retrieve Session
        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (session.payment_status !== 'paid') return res.status(402).json({ error: "Pagamento non completato." });

        // Retrieve Data from Metadata
        const { pragma_name, pragma_email, pragma_client_id, pragma_plan } = session.metadata;

        // Idempotency Check: Did we already create this user?
        const { data: existingClient } = await supabase.from('clients').select('id, email').eq('email', pragma_email).single();
        
        let clientId = existingClient ? existingClient.id : pragma_client_id;
        let apiKey = null;

        // If client doesn't exist, CREATE NOW
        if (!existingClient) {
            await supabase.from('clients').insert([{
                id: clientId,
                name: pragma_name,
                email: pragma_email,
                plan: pragma_plan, 
                status: 'Attivo', // Active immediately after payment
                usage_count: 0,
                stripe_customer_id: session.customer,
                stripe_subscription_id: session.subscription
            }]);
        } else {
            // If existed (maybe re-subscribing), update plan
             await supabase.from('clients').update({
                plan: pragma_plan,
                status: 'Attivo',
                stripe_customer_id: session.customer,
                stripe_subscription_id: session.subscription
            }).eq('id', clientId);
        }

        // Retrieve or Create Key
        const { data: existingKey } = await supabase.from('api_keys').select('key_id').eq('client_id', clientId).single();
        if (existingKey) {
            apiKey = existingKey.key_id;
        } else {
            apiKey = `pk_live_${crypto.randomBytes(24).toString('hex')}`;
            await supabase.from('api_keys').insert([{
                key_id: apiKey, client_id: clientId, name: `${pragma_plan} Key`, status: 'Attiva'
            }]);
        }

        res.json({ apiKey: apiKey, email: pragma_email });

    } catch (err) {
        console.error("Finalize Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;