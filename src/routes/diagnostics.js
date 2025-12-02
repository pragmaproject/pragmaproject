// Endpoint di diagnostica per verificare lo stato del sistema
const express = require("express");
const { ethers } = require("ethers");
const router = express.Router();

// GET /diagnostics
router.get("/", async (req, res) => {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    config: {
      contractAddress: process.env.CONTRACT_ADDRESS || "NON CONFIGURATO",
      hasAlchemyKey: !!process.env.ALCHEMY_API_KEY,
      hasPrivateKey: !!process.env.PRIVATE_KEY,
      useIPFS: process.env.USE_IPFS === "true"
    },
    blockchain: {
      connected: false,
      walletAddress: null,
      balance: null,
      contractLoaded: false
    },
    errors: []
  };

  try {
    // Verifica connessione blockchain
    const { provider, wallet, contract } = require("../lib/blockchain.js");
    
    if (provider && wallet) {
      diagnostics.blockchain.connected = true;
      diagnostics.blockchain.walletAddress = wallet.address;
      
      try {
        const balance = await provider.getBalance(wallet.address);
        diagnostics.blockchain.balance = ethers.formatEther(balance);
        diagnostics.blockchain.balanceWei = balance.toString();
      } catch (err) {
        diagnostics.errors.push(`Errore lettura saldo: ${err.message}`);
      }
    }
    
    if (contract) {
      diagnostics.blockchain.contractLoaded = true;
    } else {
      diagnostics.errors.push("Contratto non caricato. Verifica CONTRACT_ADDRESS nel .env");
    }
    
  } catch (err) {
    diagnostics.errors.push(`Errore diagnostica blockchain: ${err.message}`);
  }

  res.json(diagnostics);
});

module.exports = router;
