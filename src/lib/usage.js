const supabase = require('./supabase');

/**
 * Traccia l'utilizzo dell'API per un cliente
 * @param {string} clientId - ID del cliente
 * @param {string} endpoint - Endpoint chiamato (es. /certify)
 * @param {string} method - Metodo HTTP (POST, GET)
 * @param {string} ip - Indirizzo IP del chiamante
 */
async function trackUsage(clientId, endpoint, method, ip) {
    try {
        // 1. Inserisci il log dettagliato (Audit Trail)
        const { error: logError } = await supabase
            .from('usage_logs')
            .insert([{
                client_id: clientId,
                endpoint: endpoint,
                method: method,
                status_code: 200, // Assumiamo successo per ora, o aggiorniamo dopo
                ip_address: ip
            }]);

        if (logError) console.error("⚠️ Errore salvataggio log:", logError.message);

        // 2. Incrementa il contatore totale del cliente (Atomic Increment)
        // Usiamo una chiamata RPC (Stored Procedure) o una logica semplice.
        // Per semplicità qui facciamo: Leggi -> Incrementa -> Salva
        
        const { data: client, error: readError } = await supabase
            .from('clients')
            .select('usage_count')
            .eq('id', clientId)
            .single();

        if (!readError && client) {
            await supabase
                .from('clients')
                .update({ usage_count: (client.usage_count || 0) + 1 })
                .eq('id', clientId);
            
            console.log(`📈 Usage aggiornato per ${clientId}: ${client.usage_count + 1}`);
        }

    } catch (err) {
        console.error("🔥 Errore critico Tracking:", err.message);
    }
}

module.exports = { trackUsage };