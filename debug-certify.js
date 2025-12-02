// Script di debug per testare la certificazione via API
require("dotenv").config();
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const API_URL = process.env.API_URL || "http://localhost:8080";

async function testCertifyAPI() {
  console.log("🧪 Test Certificazione via API\n");
  console.log("API URL:", API_URL);
  console.log("");

  // Crea un file di test
  const testContent = `Test file content ${Date.now()}`;
  const testFilePath = "./test-file.txt";
  fs.writeFileSync(testFilePath, testContent);
  
  console.log("1️⃣ Creazione file di test");
  console.log("   File:", testFilePath);
  console.log("   Contenuto:", testContent);
  console.log("");

  try {
    // Prepara il form data
    const formData = new FormData();
    formData.append("file", fs.createReadStream(testFilePath));
    formData.append("creator_wallet", "0x03454f6CdB45B55AFE58a86008B65e085028Bd31");
    formData.append("declared_type", "human");

    console.log("2️⃣ Invio richiesta POST a /certify");
    console.log("   Creator:", "0x03454f6CdB45B55AFE58a86008B65e085028Bd31");
    console.log("   Type: human");
    console.log("");

    const response = await axios.post(`${API_URL}/certify`, formData, {
      headers: formData.getHeaders(),
      timeout: 60000 // 60 secondi
    });

    console.log("✅ Risposta ricevuta!");
    console.log("   Status:", response.status);
    console.log("   Data:", JSON.stringify(response.data, null, 2));
    console.log("");

    if (response.data.txHash) {
      console.log("3️⃣ Verifica sulla blockchain");
      console.log("   Hash certificato:", response.data.hash);
      console.log("   Transaction Hash:", response.data.txHash);
      console.log("   Verifica su Etherscan:");
      console.log(`   https://sepolia.etherscan.io/tx/${response.data.txHash}`);
      console.log("");

      // Attendi e verifica
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      try {
        const verifyResponse = await axios.get(`${API_URL}/verify/${response.data.hash}`);
        console.log("✅ Verifica completata:");
        console.log(JSON.stringify(verifyResponse.data, null, 2));
      } catch (verifyErr) {
        console.log("⚠️  Verifica non riuscita (potrebbe richiedere più tempo):", verifyErr.message);
      }
    }

  } catch (error) {
    console.error("❌ ERRORE durante la certificazione:");
    
    if (error.response) {
      console.error("   Status:", error.response.status);
      console.error("   Data:", JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error("   Nessuna risposta dal server");
      console.error("   Verifica che il server sia in esecuzione su", API_URL);
    } else {
      console.error("   Errore:", error.message);
    }
    
    if (error.stack) {
      console.error("\nStack trace:");
      console.error(error.stack);
    }
  } finally {
    // Pulisci il file di test
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  }
}

testCertifyAPI().catch(console.error);
