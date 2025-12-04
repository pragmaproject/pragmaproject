const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const supabase = require('../lib/supabase');
const router = express.Router();

// POST /billing/create-checkout-session
// Crea un link di pagamento per l'upgrade
router.post('/create-checkout-session', async (req, res) => {
    try {
        // 1. Recuperiamo l'ID cliente dal middleware (assicurati che questa rotta sia protetta!)
        // Se stai testando senza middleware per ora, puoi passare clientId nel body
        const clientId = req.user?.clientId || req.body.clientId;

        if (!clientId) {
            return res.status(400).json({ error: "Client ID mancante" });
        }

        // 2. Recuperiamo l'email del cliente dal DB (serve a Stripe per la ricevuta)
        const { data: clientData, error } = await supabase
            .from('clients')
            .select('email, stripe_customer_id')
            .eq('id', clientId)
            .single();

        if (error || !clientData) {
            return res.status(404).json({ error: "Cliente non trovato nel database" });
        }

        // 3. Creiamo (o recuperiamo) il Customer su Stripe
        let customerId = clientData.stripe_customer_id;

        if (!customerId) {
            // Se è la prima volta che paga, lo creiamo su Stripe
            const customer = await stripe.customers.create({
                email: clientData.email,
                metadata: {
                    supabase_client_id: clientId // Fondamentale per riconoscerlo dopo!
                }
            });
            customerId = customer.id;

            // Salviamo l'ID Stripe nel nostro DB per il futuro
            await supabase
                .from('clients')
                .update({ stripe_customer_id: customerId })
                .eq('id', clientId);
        }

        // 4. Creiamo la Sessione di Checkout
        // Qui definiamo cosa stiamo vendendo
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [
                {
                    // Dati del prodotto "al volo" (senza crearlo nella dashboard Stripe prima)
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Pragma Enterprise Plan',
                            description: 'Accesso illimitato alle API di notarizzazione Blockchain.',
                        },
                        unit_amount: 49900, // $499.00 (in centesimi)
                        recurring: {
                            interval: 'month', // Abbonamento mensile
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription', // O 'payment' se fosse una tantum
            success_url: `${process.env.FRONTEND_URL}?payment=success`,
            cancel_url: `${process.env.FRONTEND_URL}?payment=cancelled`,
        });

        // 5. Restituiamo l'URL al frontend
        res.json({ url: session.url });

    } catch (err) {
        console.error("Stripe Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;