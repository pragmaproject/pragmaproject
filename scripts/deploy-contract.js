const hre = require("hardhat");

async function main() {
  console.log("🚀 Inizio deploy di ContentCert...");

  // 1. Prendi il contratto usando il nome ESATTO che c'è nel file .sol
  const ContentCert = await hre.ethers.getContractFactory("ContentCert");
  
  // 2. Deploia
  const certifier = await ContentCert.deploy();
  await certifier.waitForDeployment();

  const address = await certifier.getAddress();
  
  console.log("============================================");
  console.log("✅ Contratto ContentCert deployato!");
  console.log("📍 Indirizzo:", address);
  console.log("============================================");
  console.log("⚠️  ORA: Copia l'indirizzo qui sopra e mettilo nel file .env");
  console.log("   CONTRACT_ADDRESS=" + address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});