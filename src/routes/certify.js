const express = require("express");
const multer = require("multer");
const axios = require("axios");
const { hashBufferSHA256 } = require("../lib/hashing.js");
const { uploadBufferToIPFS } = require("../lib/storage.js");
const { certifyOnChain } = require("../lib/blockchain.js");
const { serializeBigInt } = require("../lib/utils.js");
const supabase = require("../lib/supabase.js");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /certify
// Header richiesto: x-api-key
router.post("/", upload.single("file"), async (req, res) => {
  try {
    // [1] SICUREZZA ENTERPRISE
    // Recuperiamo il cliente direttamente dall'oggetto 'req.user'
    // Questo oggetto è stato popolato dal middleware 'requireApiKey' in auth.js
    const clientId = req.user ? req.user.clientId : null;

    if (!clientId) {
      // Se siamo qui ma non c'è clientId, qualcosa è andato storto nel server.js
      console.error("⛔ ERRORE CRITICO: Richiesta arrivata a /certify senza auth middleware!");
      return res.status(500).json({ error: "Errore interno di sicurezza." });
    }

    console.log(`🔐 Certificazione avviata per Cliente verificato: ${clientId}`);

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
      } catch (err) {
        console.warn("⚠️ IPFS Error:", err.message);
      }
    }

    // [5] PREPARAZIONE DATI BLOCKCHAIN
    const declared = (req.body.declared_type || "human").toLowerCase();
    const ctype = declared === "ai" ? 1 : declared === "mixed" ? 2 : 0;
    
    // Il wallet che firma la transazione (può essere quello del cliente o quello di sistema)
    const creator = req.body.creator_wallet || "0x0000000000000000000000000000000000000000";

    // Verifica preliminare (opzionale: controlla se esiste già on-chain)
    const { verifyOnChain } = require("../lib/blockchain.js");
    try {
      const existingCert = await verifyOnChain(hashHex);
      if (existingCert && existingCert.timestamp && existingCert.timestamp.toString() !== "0") {
        return res.status(409).json({ // 409 Conflict
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

    // [7] SALVATAGGIO DATABASE (Sicuro e Collegato)
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
                    client_id: clientId, // <--- QUI USIAMO L'ID SICURO
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
            // Non blocchiamo, perché la blockchain ha avuto successo
        } else {
            console.log("💾 Salvato correttamente su DB per:", clientId);
            dbData = data[0];
        }

    } catch (dbErr) {
        console.error("⚠️ Eccezione salvataggio DB:", dbErr.message);
    }

    // [8] RISPOSTA AL CLIENTE
    return res.json({
      success: true,
      hash: hashHex,
      tx_hash: txHash,
      data: dbData, // Restituisce i dettagli salvati
      usage_billed_to: clientId // Conferma chi sta pagando
    });

  } catch (err) {
    console.error("Certify Error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
