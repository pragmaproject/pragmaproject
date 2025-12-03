const supabase = require("../lib/supabase");
const { trackUsage } = require("../lib/usage"); // <--- QUESTA È LA NOVITÀ

const requireApiKey = async (req, res, next) => {
    // 1. Cerca la chiave nell'header
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({ 
            error: "Unauthorized", 
            message: "API Key mancante. Inserisci l'header 'x-api-key'." 
        });
    }

    try {
        // 2. Controlla nel DB
        const { data, error } = await supabase
            .from('api_keys')
            .select('client_id, status')
            .eq('key_id', apiKey)
            .single();

        if (error || !data) {
            return res.status(403).json({ error: "Forbidden", message: "API Key non valida." });
        }

        if (data.status !== 'Attiva') {
            return res.status(403).json({ error: "Forbidden", message: "API Key sospesa o revocata." });
        }

        // 3. INIEZIONE DEL CLIENTE
        req.user = { clientId: data.client_id };

        // 4. TRACCIAMENTO UTILIZZO (IL CONTATORE 📊)
        // Questo è il pezzo che mancava nel tuo vecchio file
        trackUsage(data.client_id, req.path, req.method, req.ip);

        console.log(`🔐 Accesso autorizzato per: ${data.client_id}`);
        next(); // Passa alla rotta successiva

    } catch (err) {
        console.error("Auth Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = requireApiKey;