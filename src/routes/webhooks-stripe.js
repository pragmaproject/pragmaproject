const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const supabase = require('../lib/supabase');
const router = express.Router();

router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (endpointSecret) {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } else {
            event = JSON.parse(req.body.toString());
        }
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const stripeCustomerId = session.customer;

        // 🔥 SBLOCCO UTENTE 🔥
        // Impostiamo lo stato su 'Attivo'
        const { error } = await supabase
            .from('clients')
            .update({ 
                plan: 'Enterprise', 
                status: 'Attivo', // <--- SBLOCCO FONDAMENTALE
                usage_count: 0,
                stripe_subscription_id: session.subscription
            })
            .eq('stripe_customer_id', stripeCustomerId);
            
        if (!error) console.log(`✅ Utente ${stripeCustomerId} sbloccato e attivato!`);
    }

    res.json({received: true});
});

module.exports = router;