const express = require('express');
const crypto = require('crypto');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const supabase = require('../lib/supabase');
const router = express.Router();

// POST /onboarding/register
router.post('/register', async (req, res) => {
    console.log("------------------------------------------------");
    console.log("🚀 ONBOARDING: Nuova richiesta di registrazione!");
    
    try {
        const { name, email, plan } = req.body;
        console.log(`👤 Dati ricevuti: ${name} (${email}) - Piano: ${plan}`);

        if (!name || !email) {
            console.warn("⚠️ Dati mancanti!");
            return res.status(400).json({ error: "Nome ed Email sono obbligatori." });
        }

        // 1. Controllo esistenza
        const { data: existingUser } = await supabase
            .from('clients')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            console.warn("⚠️ Utente già registrato:", existingUser.id);
            return res.status(409).json({ error: "Email già registrata." });
        }

        // 2. Generazione Credenziali
        const clientId = `cust_${crypto.randomBytes(8).toString('hex')}`;
        const apiKey = `pk_live_${crypto.randomBytes(24).toString('hex')}`;
        
        console.log("🔑 Generata API Key:", apiKey);

        // 3. Salvataggio Cliente
        const { error: clientError } = await supabase
            .from('clients')
            .insert([{
                id: clientId,
                name: name,
                email: email,
                plan: 'Starter', // Default
                status: 'Attivo',
                usage_count: 0
            }]);

        if (clientError) throw clientError;
        console.log("✅ Cliente salvato su DB:", clientId);

        // 4. Salvataggio API Key
        const { error: keyError } = await supabase
            .from('api_keys')
            .insert([{
                key_id: apiKey,
                client_id: clientId,
                name: 'Default Key',
                type: 'Live',
                status: 'Attiva'
            }]);

        if (keyError) throw keyError;
        console.log("✅ Chiave salvata e attiva.");

        // 5. Pagamento (Enterprise)
        let checkoutUrl = null;
        if (plan === 'Enterprise') {
            console.log("💳 Avvio procedura Stripe per Enterprise...");
            
            const customer = await stripe.customers.create({
                email: email,
                name: name,
                metadata: { supabase_client_id: clientId }
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
            console.log("🔗 Link pagamento generato:", checkoutUrl);
        }

        console.log("🎉 Onboarding completato con successo!");
        console.log("------------------------------------------------");

        res.json({
            success: true,
            apiKey: apiKey,
            clientId: clientId,
            redirectUrl: checkoutUrl
        });

    } catch (err) {
        console.error("🔥 Errore Onboarding:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;