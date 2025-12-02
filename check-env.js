// Script per verificare la configurazione del file .env
require("dotenv").config();

console.log("🔍 Verifica configurazione .env\n");

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

let hasErrors = false;

if (!ALCHEMY_API_KEY || ALCHEMY_API_KEY === "your_alchemy_api_key_here" || ALCHEMY_API_KEY.trim() === "") {
  console.error("❌ ALCHEMY_API_KEY: NON CONFIGURATA");
  console.error("   Ottieni la tua API key da: https://dashboard.alchemy.com/");
  hasErrors = true;
} else {
  console.log("✅ ALCHEMY_API_KEY: Configurata");
  console.log(`   Valore: ${ALCHEMY_API_KEY.substring(0, 10)}...`);
}

if (!PRIVATE_KEY || PRIVATE_KEY === "your_private_key_here" || PRIVATE_KEY.trim() === "") {
  console.error("❌ PRIVATE_KEY: NON CONFIGURATA");
  console.error("   Usa la chiave privata del tuo wallet (senza 0x)");
  hasErrors = true;
} else {
  console.log("✅ PRIVATE_KEY: Configurata");
  console.log(`   Valore: ${PRIVATE_KEY.substring(0, 10)}...`);
}

if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS.trim() === "") {
  console.log("ℹ️  CONTRACT_ADDRESS: Non ancora configurata (normale prima del deploy)");
} else {
  console.log("✅ CONTRACT_ADDRESS: Configurata");
  console.log(`   Valore: ${CONTRACT_ADDRESS}`);
}

console.log("");

if (hasErrors) {
  console.error("⚠️  Correggi gli errori sopra prima di eseguire il deploy!");
  process.exit(1);
} else {
  console.log("✅ Configurazione OK! Puoi procedere con il deploy.");
}
