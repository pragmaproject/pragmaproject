const express = require("express");
const multer = require("multer");
const axios = require("axios");
const { hashBufferSHA256 } = require("../lib/hashing.js");
const { uploadBufferToIPFS } = require("../lib/storage.js");
const { certifyOnChain } = require("../lib/blockchain.js");
const { serializeBigInt } = require("../lib/utils.js");
const supabase = require("../lib/supabase.js");
const { triggerWebhook } = require("../lib/webhooks.js"); // Assicurati di aver creato questo file prima!

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /certify
// Header richiesto: x-api-key
router.post("/", upload.single("file"), async (req, res) => {
  try {
    // [1] SICUREZZA ENTERPRISE
    // Recuperiamo il cliente dal middleware (req.user popolato da auth.js)
    const clientId = req.user ? req.user.clientId : null;

    if (!clientId) {
      console.error("⛔ ERRORE CRITICO: Richiesta arrivata a /certify senza auth middleware!");
      return res.status(500).json({ error: "Errore interno di sicurezza: Cliente non identificato." });
    }

    console.log(`🔐 Certificazione avviata per Cliente: ${clientId}`);

    // [2] GESTIONE FILE (Buffer o URL)
    let buffer;
    if (req.file) {
      buffer = req.file.buffer;
    } else if (req.body.file_url) {
      const response = await axios.get(req.body.file_url, { responseType: "arraybuffer" });
      buffer = Buffer.from(response.data);
    } else {
      return res.status(400).json({ error: "File mancante. Invia un file o un 'file_url'." });
    }

    // [3] CALCOLO HASH
    const hashHex = "0x" + hashBufferSHA256(buffer);
    console.log("📋 Hash calcolato:", hashHex);

    // [4] IPFS (Opzionale)
    let ipfsCid = null;
    if (process.env.USE_IPFS === "true") {
      try {
        ipfsCid = await uploadBufferToIPFS(buffer);
      } catch (ipfsErr) {
        console.warn("⚠️ IPFS Error:", ipfsErr.message);
      }
    }

    // [5] PREPARAZIONE DATI BLOCKCHAIN
    const declared = (req.body.declared_type || "human").toLowerCase();
    const ctype = declared === "ai" ? 1 : declared === "mixed" ? 2 : 0;
    const creator = req.body.creator_wallet || "0x0000000000000000000000000000000000000000";

    // Verifica preliminare (opzionale)
    const { verifyOnChain } = require("../lib/blockchain.js");
    try {
      const existingCert = await verifyOnChain(hashHex);
      if (existingCert && existingCert.timestamp && existingCert.timestamp.toString() !== "0") {
        return res.status(409).json({ 
            error: "Contenuto già certificato", 
            hash: hashHex,
            message: "Questo file è già presente sulla blockchain."
        });
      }
    } catch (verifyErr) {}

    console.log("🚀 Invio transazione alla Blockchain...");
    
    // [6] TRANSAZIONE BLOCKCHAIN
    const receipt = await certifyOnChain(hashHex, creator, ctype);
    const serializedReceipt = serializeBigInt(receipt);
    const txHash = serializedReceipt.transactionHash || serializedReceipt.hash;
    
    console.log("✅ Confermata su Blockchain! TX:", txHash);

    // [7] SALVATAGGIO DATABASE + WEBHOOK
    let dbData = null;
    try {
        const fileMetadata = {
            fileName: req.file ? req.file.originalname : 'url_content',
            mimeType: req.file ? req.file.mimetype : 'unknown',
            sizeBytes: buffer.length
        };

        // NOTA BENE: Qui destrutturiamo 'error' per usarlo nell'if subito sotto
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
            console.error("❌ Errore Supabase INSERT:", error.message);
        } else {
            console.log("💾 Salvato correttamente su DB per:", clientId);
            dbData = data[0];

            // --- WEBHOOK TRIGGER ---
            // Ora 'dbData' esiste sicuramente
            // Costruiamo l'URL per il download PDF
            const host = req.get('host');
            const protocol = req.protocol;
            const pdfUrl = `${protocol}://${host}/download/${hashHex}`;

            // Chiamata sicura al webhook (senza await per non bloccare)
            try {
                triggerWebhook(clientId, 'certification.success', {
                    cert_id: dbData.cert_id,
                    hash: hashHex,
                    tx_hash: txHash,
                    block: serializedReceipt.blockNumber,
                    pdf_url: pdfUrl
                });
            } catch (hookErr) {
                console.error("⚠️ Errore nel trigger Webhook:", hookErr.message);
            }
        }

    } catch (dbErr) {
        // Qui catturiamo errori generici del blocco DB
        console.error("⚠️ Eccezione blocco DB:", dbErr.message);
    }

    // [8] RISPOSTA AL CLIENTE
    return res.json({
      success: true,
      hash: hashHex,
      tx_hash: txHash,
      data: dbData, 
      usage_billed_to: clientId
    });

  } catch (err) {
    // Questo è il blocco finale che catturava l'errore "error is not defined"
    console.error("Certify Error:", err);
    // Usiamo 'err.message' perché la variabile nel catch si chiama 'err'
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
