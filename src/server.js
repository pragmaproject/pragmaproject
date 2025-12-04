const express = require("express");
const cors = require("cors");
const path = require("path");

// --- DOCUMENTAZIONE API (Swagger) ---
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger'); // Assicurati di aver creato src/swagger.js

// --- SICUREZZA (Middleware) ---
// Questo file deve esistere in src/middleware/auth.js
const requireApiKey = require("./middleware/auth");

const app = express();

// =========================================================
// 1. CONFIGURAZIONE GLOBALE
// =========================================================
app.use(cors()); // Abilita chiamate da qualsiasi browser (CORS)
app.use(express.json()); // Permette di leggere i JSON nel body
app.use(express.urlencoded({ extended: true })); // Permette di leggere i form data

// =========================================================
// 2. FRONTEND (Dashboard & Documentazione)
// =========================================================

// Serve la tua Dashboard HTML (index.html) dalla cartella 'public'
app.use(express.static(path.join(__dirname, "../public")));

// Serve la Documentazione Swagger per gli investitori
// Vai su: http://localhost:3000/api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));


// =========================================================
// 3. ROTTE PUBBLICHE (Senza Password)
// =========================================================

// Health Check (per vedere se il server è vivo)
app.get("/api-status", (req, res) => {
    res.json({ 
        status: "online", 
        version: "1.0.0", 
        environment: process.env.NODE_ENV || "development",
        message: "Pragma Enterprise API is running 🚀" 
    });
});

// Verifica: Deve essere pubblica per permettere a chiunque di controllare un certificato
// File: src/routes/verify.js
app.use("/verify", require("./routes/verify"));


// =========================================================
// 4. ROTTE PROTETTE (🔐 Serve API Key)
// =========================================================

// Certificazione: Richiede 'x-api-key' nell'header
// File: src/routes/certify.js
app.use("/certify", requireApiKey, require("./routes/certify"));

// Storico: Richiede 'x-api-key' nell'header
// File: src/routes/history.js
app.use("/history", requireApiKey, require("./routes/history"));


// =========================================================
// 5. GESTIONE ERRORI GLOBALE
// =========================================================
app.use((err, req, res, next) => {
    console.error("🔥 Errore Server Non Gestito:", err.stack);
    
    // Risposta standardizzata in caso di crash
    res.status(500).json({ 
        error: "Internal Server Error", 
        message: "Si è verificato un errore imprevisto nel server.",
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ... altre rotte ...
app.use("/certify", requireApiKey, require("./routes/certify"));
app.use("/history", requireApiKey, require("./routes/history"));
app.use("/history", requireApiKey, require("./routes/history"));

// NUOVA ROTTA PDF (Pubblica, così si può scaricare facilmente)
app.use("/download", require("./routes/download")); 

// ... gestione errori ...


// ... gli altri require ...
// AGGIUNGI QUESTA RIGA DOVE CI SONO GLI ALTRI APP.USE:

// Billing: Creazione link di pagamento
// Richiede: x-api-key nell'header
app.use("/billing", requireApiKey, require("./routes/billing"));

// =========================================================
// 6. AVVIO DEL SERVER
// =========================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
    ==================================================
    🚀 PRAGMA API SERVER AVVIATO
    ==================================================
    📡 API URL:      http://localhost:${PORT}
    📄 Docs (Swagger): http://localhost:${PORT}/api-docs
    🖥️  Dashboard:    http://localhost:${PORT}
    🛡️  Sicurezza:    Attiva su /certify e /history
    ==================================================
    `);
});


// NUOVA ROTTA CONSUMI
app.use("/usage", requireApiKey, require("./routes/usage"));

