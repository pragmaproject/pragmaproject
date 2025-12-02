require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// --- CONFIG ---
const RPC_URL = process.env.ALCHEMY_API_KEY
  ? `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
  : "";
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// --- PROVIDER & WALLET ---
let provider = null;
let wallet = null;
let contract = null;

try {
  if (!RPC_URL || !PRIVATE_KEY) {
    console.warn("⚠️  Blockchain non configurata: ALCHEMY_API_KEY o PRIVATE_KEY mancanti");
  } else {
    provider = new ethers.JsonRpcProvider(RPC_URL);
    wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    // --- CONTRATTO ---
    const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
    
    if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      console.warn("⚠️  CONTRACT_ADDRESS non configurato nel file .env");
    } else {
      // ABI dal JSON compilato dal contratto Solidity
      const abiPath = path.join(__dirname, "../../artifacts/contracts/ContentCert.sol/ContentCert.json");
      
      if (!fs.existsSync(abiPath)) {
        console.warn("⚠️  File ABI non trovato. Esegui 'npx hardhat compile' prima di avviare il server.");
      } else {
        const contractJson = JSON.parse(fs.readFileSync(abiPath));
        const contractABI = contractJson.abi;
        contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);
        console.log("✅ Contratto blockchain caricato:", CONTRACT_ADDRESS);
      }
    }
  }
} catch (error) {
  console.error("❌ Errore durante l'inizializzazione della blockchain:", error.message);
  console.error("   Il server continuerà ma le funzioni blockchain non saranno disponibili.");
}

// --- FUNZIONI EXPORT ---
async function certifyOnChain(hash, creator, ctype) {
  if (!contract) {
    throw new Error("Contratto blockchain non configurato. Verifica CONTRACT_ADDRESS nel file .env");
  }
  
  if (!provider) {
    throw new Error("Provider blockchain non configurato");
  }
  
  // Verifica che l'hash sia nel formato corretto (bytes32 = 66 caratteri con 0x)
  if (!hash || typeof hash !== 'string' || !hash.startsWith('0x') || hash.length !== 66) {
    throw new Error(`Hash non valido. Deve essere un bytes32 (66 caratteri con 0x). Ricevuto: ${hash}`);
  }
  
  console.log("🔐 Tentativo di certificazione sulla blockchain:");
  console.log("   Hash:", hash);
  console.log("   Creatore:", creator);
  console.log("   Tipo:", ctype);
  console.log("   Wallet:", wallet.address);
  
  // Verifica il saldo del wallet
  try {
    const balance = await provider.getBalance(wallet.address);
    console.log("   Saldo wallet:", ethers.formatEther(balance), "ETH");
    
    if (balance === 0n) {
      throw new Error("Wallet senza fondi. Ottieni ETH Sepolia da un faucet.");
    }
  } catch (balanceErr) {
    console.warn("⚠️  Impossibile verificare il saldo:", balanceErr.message);
  }
  
  try {
    // ctype = 0: human, 1: ai, 2: mixed
    console.log("📤 Invio transazione...");
    const tx = await contract.certify(hash, creator, ctype);
    console.log("✅ Transazione inviata:", tx.hash);
    console.log("⏳ Attesa conferma...");
    
    const receipt = await tx.wait();
    console.log("✅ Transazione confermata!");
    console.log("   Transaction Hash:", tx.hash);
    console.log("   Block:", receipt.blockNumber);
    console.log("   Gas usato:", receipt.gasUsed.toString());
    
    // Assicurati che il receipt abbia il transactionHash
    if (!receipt.hash && tx.hash) {
      receipt.hash = tx.hash;
    }
    if (!receipt.transactionHash && tx.hash) {
      receipt.transactionHash = tx.hash;
    }
    
    return receipt;
  } catch (txErr) {
    console.error("❌ Errore durante la certificazione:", txErr.message);
    
    // Estrai il messaggio di errore più dettagliato
    if (txErr.reason) {
      throw new Error(txErr.reason);
    } else if (txErr.data && txErr.data.message) {
      throw new Error(txErr.data.message);
    } else {
      throw txErr;
    }
  }
}

async function verifyOnChain(hash) {
  if (!contract) {
    throw new Error("Contratto blockchain non configurato. Verifica CONTRACT_ADDRESS nel file .env");
  }
  
  // Il contratto restituisce un array [creator, contentType, hash, timestamp]
  // Convertiamolo in un oggetto per facilità d'uso
  const result = await contract.getCert(hash);
  
  // Se il risultato è un array, convertilo in oggetto
  if (Array.isArray(result)) {
    return {
      creator: result[0],
      contentType: result[1],
      hash: result[2],
      timestamp: result[3]
    };
  }
  
  // Se è già un oggetto, restituiscilo così com'è
  return result;
}

module.exports = {
  certifyOnChain,
  verifyOnChain,
  provider,
  wallet,
  contract
};

