const express = require("express");
const supabase = require("../lib/supabase.js");
const router = express.Router();

// GET /history/:clientId
// Esempio: /history/0x0345... (Il tuo wallet)
router.get("/:clientId", async (req, res) => {
    try {
        const { clientId } = req.params;

        console.log("📚 Richiesta storico per:", clientId);

        // Seleziona tutte le certificazioni di questo cliente
        // Ordinate dalla più recente
        const { data, error } = await supabase
            .from('certifications')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return res.json({
            success: true,
            count: data.length,
            client: clientId,
            certifications: data
        });

    } catch (err) {
        console.error("Errore History:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;