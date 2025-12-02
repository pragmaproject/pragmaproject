// Script per mostrare l'indirizzo del wallet dalla PRIVATE_KEY
require("dotenv").config();
const { ethers } = require("ethers");

const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY || PRIVATE_KEY === "your_private_key_here" || PRIVATE_KEY.trim() === "") {
  console.error("❌ PRIVATE_KEY non configurata nel file .env");
  process.exit(1);
}

try {
  // Rimuovi 0x se presente
  const cleanPrivateKey = PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY.slice(2) : PRIVATE_KEY;
  
  // Crea il wallet
  const wallet = new ethers.Wallet("0x" + cleanPrivateKey);
  
  console.log("\n📋 Informazioni Wallet\n");
  console.log("Indirizzo del wallet:", wallet.address);
  console.log("\n💡 Usa questo indirizzo per richiedere ETH Sepolia da un faucet:");
  console.log("   https://sepoliafaucet.com/");
  console.log("\n");
} catch (error) {
  console.error("❌ Errore:", error.message);
  console.error("   Verifica che la PRIVATE_KEY nel file .env sia corretta");
  process.exit(1);
}
