// Script per testare la certificazione sulla blockchain
require("dotenv").config();
const { ethers } = require("ethers");
const { certifyOnChain, verifyOnChain } = require("./src/lib/blockchain.js");
const { hashBufferSHA256 } = require("./src/lib/hashing.js");

async function testCertification() {
  console.log("🧪 Test Certificazione Blockchain\n");
  
  // Test 1: Verifica configurazione
  console.log("1️⃣ Verifica Configurazione");
  console.log("   CONTRACT_ADDRESS:", process.env.CONTRACT_ADDRESS || "NON CONFIGURATO");
  console.log("   ALCHEMY_API_KEY:", process.env.ALCHEMY_API_KEY ? "Configurata" : "NON CONFIGURATA");
  console.log("   PRIVATE_KEY:", process.env.PRIVATE_KEY ? "Configurata" : "NON CONFIGURATA");
  console.log("");
  
  // Test 2: Crea un hash di test
  console.log("2️⃣ Creazione Hash di Test");
  const testContent = Buffer.from("Test content " + Date.now());
  const hashHex = "0x" + hashBufferSHA256(testContent);
  console.log("   Hash generato:", hashHex);
  console.log("   Lunghezza:", hashHex.length, "caratteri (dovrebbe essere 66)");
  
  if (hashHex.length !== 66) {
    console.error("❌ ERRORE: Hash non valido! Deve essere 66 caratteri (0x + 64 hex)");
    process.exit(1);
  }
  console.log("");
  
  // Test 3: Verifica se già certificato
  console.log("3️⃣ Verifica Certificazione Esistente");
  try {
    const existing = await verifyOnChain(hashHex);
    if (existing && existing.timestamp && existing.timestamp.toString() !== "0") {
      console.log("   ⚠️  Questo hash è già certificato!");
      console.log("   Timestamp:", existing.timestamp.toString());
      return;
    } else {
      console.log("   ✅ Hash non ancora certificato, procedo...");
    }
  } catch (err) {
    console.log("   ℹ️  Hash non trovato (normale per nuovo contenuto)");
  }
  console.log("");
  
  // Test 4: Tentativo di certificazione
  console.log("4️⃣ Tentativo di Certificazione");
  const creator = process.env.PRIVATE_KEY 
    ? new ethers.Wallet(process.env.PRIVATE_KEY).address 
    : "0x0000000000000000000000000000000000000000";
  
  try {
    const receipt = await certifyOnChain(hashHex, creator, 0);
    console.log("");
    console.log("✅✅✅ CERTIFICAZIONE RIUSCITA! ✅✅✅");
    console.log("   Transaction Hash:", receipt.transactionHash);
    console.log("   Block Number:", receipt.blockNumber.toString());
    console.log("");
    
    // Test 5: Verifica immediata
    console.log("5️⃣ Verifica Certificazione");
    await new Promise(resolve => setTimeout(resolve, 2000)); // Attendi 2 secondi
    const verified = await verifyOnChain(hashHex);
    
    if (verified && verified.timestamp && verified.timestamp.toString() !== "0") {
      console.log("   ✅ Certificazione verificata sulla blockchain!");
      console.log("   Creatore:", verified.creator);
      console.log("   Timestamp:", verified.timestamp.toString());
    } else {
      console.log("   ⚠️  Certificazione non ancora visibile (potrebbe richiedere più tempo)");
    }
    
  } catch (err) {
    console.error("");
    console.error("❌ ERRORE durante la certificazione:");
    console.error("   Messaggio:", err.message);
    console.error("");
    console.error("Possibili cause:");
    console.error("   1. Wallet senza fondi ETH Sepolia");
    console.error("   2. Hash già certificato");
    console.error("   3. Problema di connessione alla blockchain");
    console.error("   4. Contratto non deployato correttamente");
    process.exit(1);
  }
}

testCertification().catch(console.error);
