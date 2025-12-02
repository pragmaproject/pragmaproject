// Verifica diretta sul contratto
require("dotenv").config();
const { verifyOnChain } = require("./src/lib/blockchain.js");

const hash = "0x609f3111c9ffb9c9cfd46e7c1fbafa08b9944646411a90a4d4cf92a5d7e2242b";

async function verifyDirect() {
  console.log("🔍 Verifica Diretta sul Contratto\n");
  console.log("Hash da verificare:", hash);
  console.log("");

  try {
    const result = await verifyOnChain(hash);
    
    console.log("📋 Risultato dal contratto:");
    console.log(JSON.stringify(result, (key, value) => {
      if (typeof value === 'bigint') {
        return value.toString();
      }
      return value;
    }, 2));
    console.log("");

    if (result) {
      const timestamp = result.timestamp ? result.timestamp.toString() : "0";
      const timestampNum = BigInt(timestamp);
      
      if (timestampNum !== 0n) {
        console.log("✅ CERTIFICAZIONE TROVATA!");
        console.log("   Creatore:", result.creator);
        console.log("   Tipo:", result.contentType);
        console.log("   Timestamp:", timestamp);
        console.log("   Data:", new Date(parseInt(timestamp) * 1000).toLocaleString());
      } else {
        console.log("⚠️  Hash trovato ma timestamp è 0 - non certificato");
      }
    } else {
      console.log("❌ Nessun risultato dal contratto");
    }
  } catch (err) {
    console.error("❌ Errore:", err.message);
    console.error(err.stack);
  }
}

verifyDirect();
