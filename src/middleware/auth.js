const supabase = require("../lib/supabase");

const requireApiKey = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({ error: "Unauthorized", message: "API Key mancante." });
    }

    try {
        // 1. Recupera chiave e dati del cliente collegato
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

        // Controllo esistenza chiave
        if (error || !keyData) {
            return res.status(403).json({ error: "Forbidden", message: "API Key non valida." });
        }

        // Controllo stato della chiave (es. se l'hai revocata tu manualmente)
        if (keyData.status !== 'Attiva') {
            return res.status(403).json({ error: "Forbidden", message: "API Key sospesa." });
        }

        const client = keyData.clients;

        // --- 🔥 CONTROLLO STATO ACCOUNT (Pay-to-Play) 🔥 ---
        // Questo è il pezzo che mancava. 
        // Se lo stato è "In Attesa" (non ha pagato) o "Sospeso", blocca tutto.
        if (client.status !== 'Attivo') {
            return res.status(403).json({ 
                error: "Forbidden", 
                message: "Account non attivo. Completa il pagamento per abilitare questa API Key." 
            });
        }

        // 2. Controllo Limiti (Solo per chi scrive/certifica)
        const USAGE_LIMIT = 1000;
        const planNormalized = (client.plan || "").trim().toLowerCase();
        
        // Blocca solo se è POST (scrittura), è Starter e ha finito i crediti
        if (req.method === 'POST' && planNormalized === 'starter' && client.usage_count >= USAGE_LIMIT) {
            return res.status(402).json({ 
                error: "Payment Required", 
                message: `Hai raggiunto il limite del piano Starter. Contatta sales@pragma.io per upgrade.` 
            });
        }

        // 3. Iniettiamo il cliente nella richiesta
        req.user = { clientId: client.id, plan: client.plan };

        console.log(`🔐 Accesso autorizzato: ${client.id}`);

        next();

    } catch (err) {
        console.error("Auth Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = requireApiKey;