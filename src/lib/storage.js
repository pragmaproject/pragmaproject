require("dotenv").config();

// IPFS client - creato solo se necessario
let client = null;

function getIPFSClient() {
  if (client !== null) return client; // null significa già provato e fallito
  
  // Verifica se IPFS è configurato
  const projectId = process.env.IPFS_PROJECT_ID || "";
  const projectSecret = process.env.IPFS_PROJECT_SECRET || "";
  
  if (!projectId || !projectSecret) {
    client = null; // Marca come non disponibile
    return null;
  }
  
  try {
    const { create } = require("ipfs-http-client");
    
    // Autenticazione base64 per Infura
    const auth = "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
    
    client = create({
      host: "ipfs.infura.io",
      port: 5001,
      protocol: "https",
      headers: {
        authorization: auth
      }
    });
    
    return client;
  } catch (error) {
    console.warn("⚠️  IPFS client non disponibile:", error.message);
    client = null;
    return null;
  }
}

/**
 * Carica un buffer su IPFS e ritorna il CID
 * @param {Buffer} buffer
 * @returns {Promise<string|null>} CID o null se IPFS non è disponibile
 */
async function uploadBufferToIPFS(buffer) {
  const ipfsClient = getIPFSClient();
  if (!ipfsClient) {
    return null; // IPFS non configurato, ritorna null invece di lanciare errore
  }
  
  try {
    const result = await ipfsClient.add(buffer);
    return result.path; // CID
  } catch (error) {
    console.warn("⚠️  Errore durante l'upload su IPFS:", error.message);
    return null; // Ritorna null invece di lanciare errore
  }
}

module.exports = {
  uploadBufferToIPFS
};
