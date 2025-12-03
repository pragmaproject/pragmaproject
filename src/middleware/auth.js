const supabase = require("../lib/supabase");
// Rimuoviamo trackUsage da qui, lo useremo solo nel controller
// const { trackUsage } = require("../lib/usage"); 

const requireApiKey = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({ error: "Unauthorized", message: "API Key mancante." });
    }

    try {
        // 1. Recupera chiave e cliente
        const { data: keyData, error } = await supabase
            .from('api_keys')
            .select(`
                client_id, 
                status,
                clients (
                    id,
                    plan,
                    usage_count,
                    status
                )
            `)
            .eq('key_id', apiKey)
            .single();

        if (error || !keyData) {
            return res.status(403).json({ error: "Forbidden", message: "API Key non valida." });
        }

        if (keyData.status !== 'Attiva') {
            return res.status(403).json({ error: "Forbidden", message: "API Key sospesa." });
        }

        const client = keyData.clients;

        // 2. Controllo Limiti (PREVENTIVO)
        // Controlliamo se ha ABBASTANZA crediti, ma NON li scaliamo ancora.
        const USAGE_LIMIT = 1000;
        const planNormalized = (client.plan || "").trim().toLowerCase();
        
        if (req.method === 'POST' && planNormalized === 'starter' && client.usage_count >= USAGE_LIMIT) {
            return res.status(402).json({ 
                error: "Payment Required", 
                message: `Hai raggiunto il limite del piano Starter. Contatta sales@pragma.io.` 
            });
        }

        // 3. Iniettiamo il cliente
        req.user = { clientId: client.id, plan: client.plan };

        // NOTA: Abbiamo rimosso trackUsage() da qui.
        // L'addebito avverrà solo in certify.js dopo il successo.
        console.log(`🔐 Accesso autorizzato: ${client.id}`);

        next();

    } catch (err) {
        console.error("Auth Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = requireApiKey;