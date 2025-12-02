// Test rapido del server
console.log("Avvio test server...");

try {
  require("./src/server.js");
  console.log("✅ Server avviato correttamente!");
  console.log("   Il server dovrebbe essere in ascolto su http://localhost:8080");
  console.log("\nPremi Ctrl+C per fermare il server");
} catch (error) {
  console.error("❌ Errore durante l'avvio del server:");
  console.error(error);
  process.exit(1);
}
