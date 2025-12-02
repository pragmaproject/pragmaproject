const express = require("express");
const supabase = require("../lib/supabase");
const { generateCertificate } = require("../lib/pdfGenerator");
const router = express.Router();

// GET /download/:hash
router.get("/:hash", async (req, res) => {
    try {
        const { hash } = req.params;

        // 1. Recupera i dati dal DB
        const { data, error } = await supabase
            .from('certifications')
            .select('*')
            .eq('content_hash', hash)
            .single();

        if (error || !data) {
            return res.status(404).send("Certificato non trovato.");
        }

        // 2. Imposta gli header per il download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Certificate_${hash.substring(0, 10)}.pdf`);

        // 3. Genera il PDF
        await generateCertificate(res, data);

    } catch (err) {
        console.error("Errore PDF:", err);
        res.status(500).send("Errore generazione PDF");
    }
});

module.exports = router;