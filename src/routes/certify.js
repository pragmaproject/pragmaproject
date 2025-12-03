const express = require("express");
const multer = require("multer");
const axios = require("axios");
const { hashBufferSHA256 } = require("../lib/hashing.js");
const { uploadBufferToIPFS } = require("../lib/storage.js");
const { certifyOnChain } = require("../lib/blockchain.js");
const { serializeBigInt } = require("../lib/utils.js");
const supabase = require("../lib/supabase.js");
const { triggerWebhook } = require("../lib/webhooks.js");
const { trackUsage } = require("../lib/usage.js"); // <--- NUOVO IMPORT QUI

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const clientId = req.user ? req.user.clientId : null;

    if (!clientId) {
      return res.status(500).json({ error: "Errore interno di sicurezza." });
    }

    // [1] GESTIONE FILE
    let buffer;
    if (req.file) {
      buffer = req.file.buffer;
    } else if (req.body.file_url) {
      const response = await axios.get(req.body.file_url, { responseType: "arraybuffer" });
      buffer = Buffer.from(response.data);
    } else {
      return res.status(400).json({ error: "File mancante." });
    }

    const hashHex = "0x" + hashBufferSHA256(buffer);

    // [2] IPFS (Opzionale)
    let ipfsCid = null;
    if (process.env.USE_IPFS === "true") {
      try {
        ipfsCid = await uploadBufferToIPFS(buffer);
      } catch (ipfsErr) {}
    }

    const declared = (req.body.declared_type || "human").toLowerCase();
    const ctype = declared === "ai" ? 1 : declared === "mixed" ? 2 : 0;
    const creator = req.body.creator_wallet || "0x0000000000000000000000000000000000000000";

    // [3] VERIFICA ESISTENZA (Se esiste, usciamo PRIMA di pagare)
    const { verifyOnChain } = require("../lib/blockchain.js");
    try {
      const existingCert = await verifyOnChain(hashHex);
      // Se il timestamp > 0, vuol dire che è già registrato
      if (existingCert && existingCert.timestamp && existingCert.timestamp.toString() !== "0") {
        console.log("⚠️ File già presente. Nessun addebito.");
        return res.status(409).json({ 
            error: "Contenuto già certificato", 
            hash: hashHex,
            message: "Questo file è già presente sulla blockchain."
        });
      }
    } catch (verifyErr) {}

    // [4] TRANSAZIONE BLOCKCHAIN (Qui si spende gas, ma non crediti API ancora)
    console.log("🚀 Invio transazione...");
    const receipt = await certifyOnChain(hashHex, creator, ctype);
    const serializedReceipt = serializeBigInt(receipt);
    const txHash = serializedReceipt.transactionHash || serializedReceipt.hash;

    // [5] SALVATAGGIO DB & ADDEBITO
    let dbData = null;
    try {
        const fileMetadata = {
            fileName: req.file ? req.file.originalname : 'url_content',
            mimeType: req.file ? req.file.mimetype : 'unknown',
            sizeBytes: buffer.length
        };

        const { data, error } = await supabase
            .from('certifications')
            .insert([
                {
                    cert_id: `cert_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                    client_id: clientId,
                    content_hash: hashHex,
                    tx_hash: txHash,
                    block_number: serializedReceipt.blockNumber,
                    blockchain_timestamp: new Date().toISOString(),
                    content_type: declared,
                    status: 'Confermata',
                    gas_used: serializedReceipt.gasUsed ? serializedReceipt.gasUsed.toString() : null,
                    ipfs_cid: ipfsCid,
                    metadata: fileMetadata
                }
            ])
            .select();

        if (error) {
            console.error("❌ Errore Supabase:", error.message);
        } else {
            dbData = data[0];

            // 🔥 ADDEBITO CREDITI (TRACK USAGE) 🔥
            // Lo facciamo solo ora che siamo sicuri del successo
            console.log(`💰 Addebito 1 credito a ${clientId}`);
            trackUsage(clientId, '/certify', 'POST', req.ip);

            // Webhook
            const host = req.get('host');
            const protocol = req.protocol;
            const pdfUrl = `${protocol}://${host}/download/${hashHex}`;
            
            try {
                triggerWebhook(clientId, 'certification.success', {
                    cert_id: dbData.cert_id,
                    hash: hashHex,
                    tx_hash: txHash,
                    pdf_url: pdfUrl
                });
            } catch (hookErr) {}
        }

    } catch (dbErr) {
        console.error("⚠️ Eccezione DB:", dbErr.message);
    }

    return res.json({
      success: true,
      hash: hashHex,
      tx_hash: txHash,
      data: dbData, 
      usage_billed_to: clientId
    });

  } catch (err) {
    console.error("Certify Error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
