const axios = require('axios');
const crypto = require('crypto');
const supabase = require('./supabase');

/**
 * Invia una notifica Webhook a un cliente specifico
 * @param {string} clientId - L'ID del cliente da notificare
 * @param {string} eventType - Il tipo di evento (es. 'certification.success')
 * @param {object} payload - I dati da inviare (hash, tx, ecc.)
 */
async function triggerWebhook(clientId, eventType, payload) {
    try {
        console.log(`🔔 Webhook: Cerco endpoint per cliente ${clientId}...`);

        // 1. Cerca se il cliente ha configurato un Webhook
        const { data: endpoints, error } = await supabase
            .from('webhook_endpoints')
            .select('*')
            .eq('client_id', clientId)
            .eq('is_active', true);

        if (error || !endpoints || endpoints.length === 0) {
            console.log(`🔕 Nessun webhook attivo per ${clientId}. Skip.`);
            return;
        }

        // 2. Invia la notifica a tutti gli endpoint trovati
        for (const endpoint of endpoints) {
            // Controlla se l'endpoint è interessato a questo evento (opzionale, per ora inviamo tutto)
            
            const timestamp = Date.now();
            const payloadString = JSON.stringify({
                event: eventType,
                created_at: timestamp,
                data: payload
            });

            // 3. FIRMA DIGITALE (Sicurezza Enterprise)
            // Creiamo un codice segreto usando la chiave del cliente
            // Il cliente potrà verificare che siamo noi
            const signature = crypto
                .createHmac('sha256', endpoint.secret)
                .update(payloadString)
                .digest('hex');

            console.log(`🚀 Invio webhook a: ${endpoint.url}`);

            // 4. Esegui la richiesta HTTP (Fire and Forget)
            // Non usiamo 'await' perché non vogliamo rallentare la risposta al cliente
            axios.post(endpoint.url, JSON.parse(payloadString), {
                headers: {
                    'Content-Type': 'application/json',
                    'Pragma-Signature': signature,
                    'Pragma-Event': eventType,
                    'User-Agent': 'Pragma-Notifier/1.0'
                },
                timeout: 5000 // Timeout breve (5s)
            }).catch(err => {
                console.error(`❌ Errore invio webhook a ${endpoint.url}:`, err.message);
                // Qui in futuro potresti salvare l'errore nel DB per riprovare
            });
        }

    } catch (err) {
        console.error("🔥 Errore critico Webhook System:", err.message);
    }
}

module.exports = { triggerWebhook };