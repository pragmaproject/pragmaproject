const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const supabase = require('../lib/supabase');
const router = express.Router();

// Questa rotta DEVE ricevere il body RAW (non JSON) per verificare la firma
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // 1. Verifica che la richiesta arrivi davvero da Stripe (Sicurezza)
        // In produzione serve STRIPE_WEBHOOK_SECRET (lo prenderemo dopo)
        // Per ora in test locale possiamo saltare la verifica stretta o usare una chiave di test
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
        
        if (endpointSecret) {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } else {
            // Fallback per test rapidi senza CLI (non sicuro in prod, ma ok per ora)
            event = JSON.parse(req.body.toString());
        }
    } catch (err) {
        console.error(`⚠️  Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // 2. Gestione Eventi
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log("💰 Pagamento Riuscito! Session ID:", session.id);
            
            // Recuperiamo l'ID cliente che avevamo nascosto nei metadata
            // Nel billing.js avevamo messo: metadata: { supabase_client_id: clientId }
            // Ma attenzione: Stripe mette i metadata del customer, non della sessione a volte.
            // Controlliamo dove li abbiamo messi.
            // Nel nostro billing.js non li avevamo messi nella sessione, ma nel customer creation.
            
            // Recuperiamo il cliente dal DB usando l'email o il customer ID di Stripe
            const stripeCustomerId = session.customer;
            const customerEmail = session.customer_details?.email;

            console.log(`👤 Utente Stripe: ${stripeCustomerId} (${customerEmail})`);

            if (stripeCustomerId) {
                // AGGIORNAMENTO DATABASE: Enterprise + Reset Contatore
                const { error } = await supabase
                    .from('clients')
                    .update({ 
                        plan: 'Enterprise', 
                        usage_count: 0, // Resetta i consumi
                        stripe_subscription_id: session.subscription,
                        status: 'Attivo'
                    })
                    .eq('stripe_customer_id', stripeCustomerId);

                if (error) {
                    // Fallback: prova con l'email se l'ID non corrisponde
                    console.warn("⚠️  Errore update per ID, provo con email...");
                    await supabase.from('clients').update({ plan: 'Enterprise', usage_count: 0 }).eq('email', customerEmail);
                } else {
                    console.log("✅ Upgrade a Enterprise completato nel DB!");
                }
            }
            break;

        case 'customer.subscription.deleted':
            // Se smette di pagare, lo rimettiamo Starter
            const sub = event.data.object;
            await supabase
                .from('clients')
                .update({ plan: 'Starter' })
                .eq('stripe_customer_id', sub.customer);
            console.log("📉 Abbonamento cancellato. Downgrade a Starter.");
            break;

        default:
            console.log(`ℹ️  Evento Stripe non gestito: ${event.type}`);
    }

    // Rispondi a Stripe che hai ricevuto tutto
    res.json({received: true});
});

module.exports = router;