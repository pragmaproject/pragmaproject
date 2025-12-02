const express = require("express");
const { verifyOnChain } = require("../lib/blockchain.js");
const { serializeBigInt } = require("../lib/utils.js");

// [1] NUOVO IMPORT: Colleghiamo il database
const supabase = require("../lib/supabase.js");

const router = express.Router();

// GET /verify/:hash
router.get("/:hash", async (req, res) => {
  try {
    const hash = req.params.hash;

    // 1. VERIFICA SULLA BLOCKCHAIN (Fonte di verità primaria)
    const result = await verifyOnChain(hash);

    // Se non c'è risultato, l'hash non è certificato
    if (!result) {
      return res.status(404).json({ 
        status: "not_found",
        message: "L'hash fornito non è stato certificato sulla blockchain.",
        hash: hash
      });
    }

    // Serializza BigInt prima di inviare la risposta
    const serializedResult = serializeBigInt(result);
    
    console.log("🔍 Risultato serializzato:", JSON.stringify(serializedResult, null, 2));

    // Controlla se la certificazione esiste (timestamp != 0)
    let timestamp = "0";
    
    if (serializedResult.timestamp !== undefined && serializedResult.timestamp !== null) {
      if (typeof serializedResult.timestamp === 'string') {
        timestamp = serializedResult.timestamp;
      } else if (typeof serializedResult.timestamp === 'bigint') {
        timestamp = serializedResult.timestamp.toString();
      } else {
        timestamp = String(serializedResult.timestamp);
      }
    }
    
    console.log("📅 Timestamp estratto:", timestamp);
    
    // Se timestamp è 0 o vuoto, la certificazione non esiste
    const timestampNum = timestamp !== "0" && timestamp !== "" ? BigInt(timestamp) : 0n;
    
    console.log("🔢 Timestamp come BigInt:", timestampNum.toString());
    
    if (timestampNum === 0n || timestamp === "0" || timestamp === "") {
      const creator = serializedResult.creator || "0x0000000000000000000000000000000000000000";
      const isZeroAddress = creator === "0x0000000000000000000000000000000000000000" || 
                            creator.toLowerCase() === "0x0000000000000000000000000000000000000000";
      
      console.log("⚠️  Timestamp è 0, creator:", creator, "isZero:", isZeroAddress);
      
      if (isZeroAddress) {
        return res.status(404).json({ 
          status: "not_found",
          message: "L'hash fornito non è stato certificato sulla blockchain.",
          hash: hash,
          tip: "Se hai appena certificato questo contenuto, attendi qualche secondo e riprova."
        });
      }
      
      return res.status(404).json({ 
        status: "not_found",
        message: "L'hash fornito non è stato certificato sulla blockchain.",
        hash: hash
      });
    }

    // Il contratto restituisce: creator, contentType, hash, timestamp
    const contentTypeMap = { 0: "human", 1: "ai", 2: "mixed" };
    
    const contentType = serializedResult.contentType !== undefined && serializedResult.contentType !== null
      ? (typeof serializedResult.contentType === 'string' 
          ? parseInt(serializedResult.contentType) 
          : Number(serializedResult.contentType))
      : 0;

    // -----------------------------------------------------------
    // [2] NUOVO BLOCCO: Arricchimento dati da Supabase
    // -----------------------------------------------------------
    let dbInfo = null;
    try {
        console.log("🔎 Cerco dettagli aggiuntivi nel Database...");
        const { data, error } = await supabase
            .from('certifications')
            .select('*')
            .eq('content_hash', hash)
            .single();

        if (error && error.code !== 'PGRST116') { // Ignora errore "non trovato" (PGRST116)
            console.warn("⚠️  Errore lettura DB:", error.message);
        }

        if (data) {
            console.log("✅ Trovato nel DB:", data.cert_id);
            dbInfo = data; // Abbiamo trovato i metadati (es. nome file)
        }
    } catch (dbErr) {
        console.warn("⚠️  Errore connessione DB (continuo solo con dati Blockchain):", dbErr.message);
    }
    // -----------------------------------------------------------
    // FINE BLOCCO SUPABASE
    // -----------------------------------------------------------
    
    return res.json({
      status: "found",
      source: "blockchain_confirmed", // Conferma che la fonte primaria è la chain
      hash,
      creator: serializedResult.creator || "0x0000000000000000000000000000000000000000",
      contentType: contentType,
      declared_type: contentTypeMap[contentType] || "unknown",
      timestamp: timestamp,
      // Aggiungiamo i dati del DB se li abbiamo trovati (es. nome del file originale)
      metadata: dbInfo ? dbInfo.metadata : null,
      db_record: dbInfo // Restituisce tutto il record DB per completezza
    });

  } catch (err) {
    console.error("Errore durante la verifica:", err);
    
    if (err.message && (err.message.includes("not found") || err.message.includes("revert"))) {
      return res.status(404).json({ 
        status: "not_found",
        message: "L'hash fornito non è stato certificato sulla blockchain.",
        hash: req.params.hash
      });
    }
    
    res.status(500).json({ 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

module.exports = router;
