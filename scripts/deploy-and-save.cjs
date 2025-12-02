const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const ContentCert = await hre.ethers.getContractFactory("ContentCert");
  const contentCert = await ContentCert.deploy();

  await contentCert.waitForDeployment();

  const address = await contentCert.getAddress();
  console.log("ContentCert deployed to:", address);

  // Aggiorna il file .env con l'indirizzo del contratto
  const envPath = path.join(__dirname, "../.env");
  
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    
    // Sostituisci o aggiungi CONTRACT_ADDRESS
    if (envContent.includes("CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(
        /CONTRACT_ADDRESS=.*/,
        `CONTRACT_ADDRESS=${address}`
      );
    } else {
      envContent += `\nCONTRACT_ADDRESS=${address}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log("\n✅ Indirizzo del contratto salvato nel file .env");
  } else {
    console.log("\n⚠️  File .env non trovato. Aggiungi manualmente:");
    console.log(`CONTRACT_ADDRESS=${address}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
