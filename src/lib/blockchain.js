require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// --- CONFIGURAZIONE ---
const RPC_URL = process.env.ALCHEMY_API_KEY
  ? `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
  : process.env.RPC_URL; // Fallback se usi una URL diretta nel .env

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS; // L'indirizzo che hai appena copiato

// --- PROVIDER & WALLET ---
let provider = null;
let wallet = null;
let contract = null;

try {
  if (!RPC_URL || !PRIVATE_KEY) {
    console.warn("⚠️  Blockchain Warning: Manca RPC_URL o PRIVATE_KEY nel file .env");
  } else {
    // 1. Connessione alla rete
    provider = new ethers.JsonRpcProvider(RPC_URL);
    wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    // 2. Controllo Indirizzo Contratto
    if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      console.warn("⚠️  Blockchain Warning: CONTRACT_ADDRESS non configurato o zero.");
    } else {
      // 3. Caricamento ABI (Il manuale del contratto)
      // Nota: Punta a ContentCert.json perché il tuo contratto si chiama ContentCert
      const abiPath = path.join(__dirname, "../../artifacts/contracts/ContentCert.sol/ContentCert.json");
      
      if (!fs.existsSync(abiPath)) {
        console.warn(`⚠️  File ABI non trovato in: ${abiPath}`);
        console.warn("   Esegui 'npx hardhat compile' per generarlo.");
      } else {
        const contractJson = JSON.parse(fs.readFileSync(abiPath));
        const contractABI = contractJson.abi;
        
        // 4. Istanza del Contratto
        contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);
        console.log("------------------------------------------------");
        console.log("✅ Blockchain Ready");
        console.log("   Wallet:", wallet.address);
        console.log("   Contract:", CONTRACT_ADDRESS);
        console.log("------------------------------------------------");
      }
    }
  }
} catch (error) {
  console.error("❌ Errore critico inizializzazione Blockchain:", error.message);
}

// --- FUNZIONE 1: SCRIVERE SULLA BLOCKCHAIN ---
async function certifyOnChain(hash, creator, ctype) {
  if (!contract) throw new Error("Contratto non inizializzato.");
  
  // Validazione Hash (Deve essere bytes32 = 66 caratteri inclusi 0x)
  if (!hash || !hash.startsWith('0x') || hash.length !== 66) {
    throw new Error(`Hash non valido per Bytes32: ${hash}`);
  }
  
  console.log(`🔗 Blockchain: Invio transazione per hash ${hash.substring(0, 10)}...`);

  try {
    // Chiamata alla funzione 'certify' del tuo Smart Contract ContentCert.sol
    // function certify(bytes32 hash, address creator, uint8 contentType)
    const tx = await contract.certify(hash, creator, ctype);
    
    console.log(`⏳ Transazione inviata: ${tx.hash} (In attesa di mining...)`);
    
    // Attende 1 conferma del blocco
    const receipt = await tx.wait(1);
    
    console.log(`✅ Confermata nel blocco ${receipt.blockNumber}`);
    
    return receipt; // Contiene gasUsed, blockNumber, etc.

  } catch (err) {
    console.error("❌ Errore Blockchain Transaction:", err);
    
    // Gestione errori Smart Contract (es. "Already certified")
    if (err.reason) throw new Error(`Smart Contract Revert: ${err.reason}`);
    if (err.message.includes("Already certified")) throw new Error("Questo contenuto è già stato certificato sulla Blockchain.");
    
    throw err;
  }
}

// --- FUNZIONE 2: LEGGERE DALLA BLOCKCHAIN ---
async function verifyOnChain(hash) {
  if (!contract) throw new Error("Contratto non inizializzato.");

  try {
    // Chiamata alla funzione 'getCert' del tuo Smart Contract
    // Returns (address creator, uint8 contentType, bytes32 hash, uint256 timestamp)
    const result = await contract.getCert(hash);

    // Mappiamo il risultato (che è un array-like object) in un oggetto JS pulito
    // Nota: timestamp è un BigInt, lo convertiamo in stringa per sicurezza JSON
    return {
      creator: result[0],      // address
      contentType: Number(result[1]), // uint8 (convertiamo in numero JS)
      hash: result[2],         // bytes32
      timestamp: result[3].toString() // uint256 (BigInt -> String)
    };

  } catch (err) {
    console.error("Errore lettura Blockchain:", err);
    return null; 
  }
}

module.exports = {
  certifyOnChain,
  verifyOnChain,
  provider,
  wallet,
  contract
};

