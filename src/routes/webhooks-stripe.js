const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const supabase = require('../lib/supabase');
const crypto = require('crypto'); // Serve per generare la chiave se il webhook crea l'utente
const router = express.Router();

// Questa rotta DEVE ricevere il body RAW per verificare la firma di sicurezza
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // 1. Verifica Firma (Sicurezza Fondamentale)
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (endpointSecret) {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } else {
            // Fallback solo per test locali veloci (sconsigliato in prod senza secret)
            event = JSON.parse(req.body.toString());
        }
    } catch (err) {
        console.error(`⚠️  Webhook Signature Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // 2. Gestione Eventi
    switch (event.type) {
        
        // --- CASO A: PAGAMENTO RIUSCITO (Creazione/Attivazione Utente) ---
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log("💰 Webhook: Pagamento ricevuto! Session:", session.id);
            
            // Leggiamo i dati utente nascosti nei metadata
            const { pragma_name, pragma_email, pragma_client_id } = session.metadata || {};

            // Se mancano i metadata, potrebbe essere un pagamento non "Onboarding" (es. rinnovo manuale)
            // Ma nel nostro flusso attuale ci sono sempre.
            if (pragma_email && pragma_client_id) {
                
                // Controlliamo se l'utente esiste già (magari creato da /finalize 1 secondo prima)
                const { data: existingClient } = await supabase
                    .from('clients')
                    .select('id')
                    .eq('id', pragma_client_id)
                    .single();

                if (!existingClient) {
                    console.log(`🆕 Creazione nuovo cliente Enterprise da Webhook: ${pragma_email}`);
                    
                    // Creiamo il Cliente "Attivo"
                    const { error: clientError } = await supabase.from('clients').insert([{
                        id: pragma_client_id,
                        name: pragma_name,
                        email: pragma_email,
                        plan: 'Enterprise',
                        status: 'Attivo',
                        usage_count: 0,
                        stripe_customer_id: session.customer,
                        stripe_subscription_id: session.subscription
                    }]);

                    if (clientError) {
                        console.error("❌ Errore creazione cliente DB:", clientError.message);
                    } else {
                        // Creiamo anche una API Key di default per non lasciarlo a piedi
                        const newApiKey = `pk_live_${crypto.randomBytes(24).toString('hex')}`;
                        await supabase.from('api_keys').insert([{
                            key_id: newApiKey,
                            client_id: pragma_client_id,
                            name: 'Enterprise Key (Auto)',
                            type: 'Live',
                            status: 'Attiva'
                        }]);
                        console.log("✅ Cliente e Chiave creati con successo.");
                    }
                } else {
                    console.log("ℹ️ Cliente già esistente (creato da frontend/finalize). Aggiorno solo lo stato.");
                    // Per sicurezza, assicuriamoci che sia Enterprise e Attivo
                    await supabase.from('clients').update({ 
                        plan: 'Enterprise', 
                        status: 'Attivo',
                        stripe_customer_id: session.customer,
                        stripe_subscription_id: session.subscription 
                    }).eq('id', pragma_client_id);
                }
            } else {
                console.warn("⚠️  Webhook ricevuto senza metadata Pragma. Ignorato.");
            }
            break;

        // --- CASO B: PAGAMENTO FALLITO (Opzionale) ---
        case 'invoice.payment_failed':
            const invoice = event.data.object;
            const customerId = invoice.customer;
            console.log(`❌ Pagamento fallito per customer ${customerId}`);
            // Potresti voler sospendere l'utente qui
            // await supabase.from('clients').update({ status: 'Sospeso' }).eq('stripe_customer_id', customerId);
            break;

        // --- CASO C: CANCELLAZIONE ABBONAMENTO ---
        case 'customer.subscription.deleted':
            const sub = event.data.object;
            console.log(`📉 Abbonamento cancellato: ${sub.id}`);
            
            // Downgrade a Starter o Sospensione
            await supabase
                .from('clients')
                .update({ plan: 'Starter', status: 'Attivo' }) // Lo lasciamo attivo ma con limiti
                .eq('stripe_customer_id', sub.customer);
            break;

        default:
            console.log(`ℹ️  Evento Stripe non gestito: ${event.type}`);
    }

    // Rispondi a Stripe 200 OK (altrimenti continua a riprovare per 3 giorni!)
    res.json({received: true});
});

module.exports = router;