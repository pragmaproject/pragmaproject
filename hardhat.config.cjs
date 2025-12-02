require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Verifica che le variabili d'ambiente siano configurate correttamente
const isInvalidKey = (key) => !key || key === "your_alchemy_api_key_here" || key.trim() === "";
const isInvalidPrivateKey = (key) => !key || key === "your_private_key_here" || key.trim() === "";

if (isInvalidKey(ALCHEMY_API_KEY)) {
  console.error("\n❌ ERRORE: ALCHEMY_API_KEY non configurata correttamente nel file .env");
  console.error("   Ottieni la tua API key da: https://dashboard.alchemy.com/\n");
  process.exit(1);
}

if (isInvalidPrivateKey(PRIVATE_KEY)) {
  console.error("\n❌ ERRORE: PRIVATE_KEY non configurata correttamente nel file .env");
  console.error("   Usa la chiave privata del tuo wallet (senza 0x)\n");
  process.exit(1);
}

module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [PRIVATE_KEY]
    }
  }
};

