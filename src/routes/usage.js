const express = require("express");
const supabase = require("../lib/supabase");
const router = express.Router();

// GET /usage
// Restituisce i consumi del cliente attuale
router.get("/", async (req, res) => {
    try {
        const clientId = req.user.clientId; // Preso dal middleware auth

        const { data, error } = await supabase
            .from('clients')
            .select('usage_count, plan, name')
            .eq('id', clientId)
            .single();

        if (error) throw error;

        res.json({
            client: data.name,
            plan: data.plan,
            total_requests: data.usage_count,
            limit: data.plan === 'Enterprise' ? 'Unlimited' : 1000,
            status: 'active'
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;