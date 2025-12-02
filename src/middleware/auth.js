const supabase = require("../lib/supabase");

const requireApiKey = async (req, res, next) => {
    // 1. Cerca la chiave nell'header standard
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({ 
            error: "Unauthorized", 
            message: "API Key mancante. Inserisci l'header 'x-api-key'." 
        });
    }

    try {
        // 2. Controlla nel DB se la chiave esiste ed è attiva
        const { data, error } = await supabase
            .from('api_keys')
            .select('client_id, permissions, status')
            .eq('key_id', apiKey)
            .single();

        if (error || !data) {
            return res.status(403).json({ error: "Forbidden", message: "API Key non valida." });
        }

        if (data.status !== 'Attiva') {
            return res.status(403).json({ error: "Forbidden", message: "API Key revocata o scaduta." });
        }

        // 3. INIEZIONE DEL CLIENTE
        // Questo è il passaggio chiave: il backend "sa" chi sei senza che tu glielo dica nel body
        req.user = {
            clientId: data.client_id,
            permissions: data.permissions
        };

        // Aggiorniamo l'ultimo utilizzo (opzionale, ma utile per analytics)
        /* await supabase.from('clients').update({ last_access: new Date() }).eq('id', data.client_id); */

        console.log(`🔐 Accesso autorizzato per: ${data.client_id}`);
        next(); // Passa alla rotta successiva

    } catch (err) {
        console.error("Auth Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = requireApiKey;