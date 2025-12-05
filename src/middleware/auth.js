const supabase = require("../lib/supabase");
const PLANS = require("../config/plans"); // Importiamo la configurazione

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
                client_id, status,
                clients (id, plan, usage_count, status)
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

        // 2. Controllo Stato Account (Pay-to-Play)
        if (client.status !== 'Attivo') {
            return res.status(403).json({ 
                error: "Forbidden", 
                message: "Account non attivo. Completa il pagamento per usare l'API." 
            });
        }

        // 3. Controllo Limiti Dinamico (Tiered Volume)
        // Recuperiamo le regole del piano attuale
        const planConfig = PLANS[client.plan] || PLANS['Developer']; // Fallback sicuro
        const limit = planConfig.limit;

        // Blocca solo se è Scrittura (POST) e ha superato il limite
        if (req.method === 'POST' && client.usage_count >= limit) {
            return res.status(402).json({ 
                error: "Payment Required", 
                message: `Hai raggiunto il limite del piano ${client.plan} (${limit} richieste). Fai l'upgrade.` 
            });
        }

        // 4. Ok, passa
        req.user = { clientId: client.id, plan: client.plan };
        console.log(`🔐 Accesso: ${client.id} [${client.plan}]`);
        next();

    } catch (err) {
        console.error("Auth Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = requireApiKey;