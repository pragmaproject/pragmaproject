const express = require("express");
// ERRORE ERA QUI: Prima era './supabase', ora è '../lib/supabase'
const supabase = require("../lib/supabase"); 
const router = express.Router();

// GET /usage
// Restituisce i consumi del cliente attuale
router.get("/", async (req, res) => {
    try {
        // Recuperiamo l'ID cliente dal middleware (iniettato da auth.js)
        // Se req.user non esiste, significa che la rotta non è protetta nel server.js
        const clientId = req.user ? req.user.clientId : null;

        if (!clientId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { data, error } = await supabase
            .from('clients')
            .select('usage_count, plan, name')
            .eq('id', clientId)
            .single();

        if (error) throw error;

        // Recuperiamo il limite dal config (opzionale, o hardcoded qui per visualizzazione)
        // Per coerenza visiva:
        let limit = 1000; // Default Starter
        if (data.plan === 'Enterprise') limit = 'Unlimited';
        if (data.plan === 'Developer') limit = 50;
        if (data.plan === 'Startup') limit = 5000;
        if (data.plan === 'Scale') limit = 25000;

        res.json({
            client: data.name,
            plan: data.plan,
            total_requests: data.usage_count,
            limit: limit,
            status: 'active'
        });

    } catch (err) {
        console.error("Usage Route Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;