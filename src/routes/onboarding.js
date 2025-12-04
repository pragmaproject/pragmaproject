const express = require('express');
const crypto = require('crypto');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const supabase = require('../lib/supabase');
const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { name, email, plan } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: "Nome ed Email obbligatori." });
        }

        // 1. Controllo duplicati
        const { data: existingUser } = await supabase.from('clients').select('id').eq('email', email).single();
        if (existingUser) return res.status(409).json({ error: "Email già registrata." });

        // 2. Genera credenziali
        const clientId = `cust_${crypto.randomBytes(8).toString('hex')}`;
        const apiKey = `pk_live_${crypto.randomBytes(24).toString('hex')}`;

        // 🔥 MODIFICA QUI: Logica "No Pay, No Play" 🔥
        // Se sceglie Enterprise, lo stato nasce come "In Attesa". La chiave NON funzionerà.
        // Se sceglie Starter, lo stato nasce "Attivo".
        const initialStatus = plan === 'Enterprise' ? 'In Attesa' : 'Attivo';
        const initialPlan = plan; // Salviamo subito che voleva essere Enterprise

        // 3. Crea Cliente (Con stato condizionale)
        const { error: clientError } = await supabase.from('clients').insert([{
            id: clientId,
            name: name,
            email: email,
            plan: initialPlan,
            status: initialStatus, // <--- ECCO IL BLOCCO
            usage_count: 0
        }]);
        if (clientError) throw clientError;

        // 4. Crea API Key (Attiva, ma il cliente è sospeso quindi non va)
        await supabase.from('api_keys').insert([{
            key_id: apiKey, client_id: clientId, name: 'Default Key', type: 'Live', status: 'Attiva'
        }]);

        // 5. Pagamento Stripe
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
                success_url: `${process.env.FRONTEND_URL}?payment=success`,
                cancel_url: `${process.env.FRONTEND_URL}?payment=cancelled`,
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
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;