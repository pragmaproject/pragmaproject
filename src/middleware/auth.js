const supabase = require("../lib/supabase");
const { trackUsage } = require("../lib/usage");

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
            console.error("Auth DB Error:", error); // LOG ERRORE DB
            return res.status(403).json({ error: "Forbidden", message: "API Key non valida." });
        }

        if (keyData.status !== 'Attiva') {
            return res.status(403).json({ error: "Forbidden", message: "API Key sospesa." });
        }

        const client = keyData.clients;

        // --- 🔍 DEBUG LOG (GUARDARE QUI!) ---
        console.log("------------------------------------------------");
        console.log("👤 CLIENTE IDENTIFICATO:", client.id);
        console.log("📊 PIANO:", `'${client.plan}'`); // Gli apici mostrano se ci sono spazi
        console.log("🔢 CONTATORE:", client.usage_count, "(Tipo:", typeof client.usage_count, ")");
        console.log("------------------------------------------------");

        // --- BLOCCO LIMITI ---
        const USAGE_LIMIT = 1000;
        
        // Normalizziamo il piano (togliamo spazi e maiuscole per sicurezza)
        const planNormalized = (client.plan || "").trim().toLowerCase();
        
        // Controllo robusto: Se è 'starter' E (il contatore esiste E supera il limite)
        if (planNormalized === 'starter' && client.usage_count >= USAGE_LIMIT) {
            
            console.log("🛑 BLOCCO SCATTATO! Limite raggiunto.");
            
            return res.status(402).json({ 
                error: "Payment Required", 
                message: `Hai raggiunto il limite del piano Starter (${USAGE_LIMIT} richieste). Contatta sales@pragma.io.` 
            });
        }

        // 4. Tutto OK
        req.user = { clientId: client.id, plan: client.plan };
        trackUsage(client.id, req.path, req.method, req.ip);
        next();

    } catch (err) {
        console.error("Auth Crash:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = requireApiKey;