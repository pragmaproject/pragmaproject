const supabase = require("../lib/supabase");
const { trackUsage } = require("../lib/usage");

const requireApiKey = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({ 
            error: "Unauthorized", 
            message: "API Key mancante. Inserisci l'header 'x-api-key'." 
        });
    }

    try {
        // 1. Recupera la chiave E i dati del cliente collegato (JOIN)
        // Dobbiamo sapere il piano e il contatore del cliente
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

        // 2. Controlli Base (Esistenza e Validità Chiave)
        if (error || !keyData) {
            return res.status(403).json({ error: "Forbidden", message: "API Key non valida." });
        }

        if (keyData.status !== 'Attiva') {
            return res.status(403).json({ error: "Forbidden", message: "API Key revocata o sospesa." });
        }

        // 3. Controlli sul Cliente (Blocco Business)
        const client = keyData.clients;

        if (client.status !== 'Attivo') {
            return res.status(403).json({ error: "Forbidden", message: "Account cliente sospeso." });
        }

        // --- IL BLOCCO DEI LIMITI (QUOTA CHECK) ---
        const USAGE_LIMIT = 1000; // Limite per il piano Starter

        if (client.plan === 'Starter' && client.usage_count >= USAGE_LIMIT) {
            return res.status(402).json({ 
                error: "Payment Required", 
                message: `Hai raggiunto il limite del piano Starter (${USAGE_LIMIT} richieste). Contatta sales@pragma.io per passare a Enterprise.` 
            });
        }
        // -------------------------------------------

        // 4. Tutto OK: Iniettiamo il cliente e tracciamo l'uso
        req.user = { clientId: client.id, plan: client.plan };

        // Incrementiamo il contatore (Fire & Forget)
        trackUsage(client.id, req.path, req.method, req.ip);

        console.log(`🔐 Accesso OK: ${client.id} | Piano: ${client.plan} | Uso: ${client.usage_count}`);
        next();

    } catch (err) {
        console.error("Auth Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = requireApiKey;