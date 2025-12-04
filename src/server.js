const express = require("express");
const cors = require("cors");
const path = require("path");

// --- DOCUMENTAZIONE API (Swagger) ---
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger'); 

// --- SICUREZZA (Middleware) ---
const requireApiKey = require("./middleware/auth");

const app = express();

// =========================================================
// 1. CONFIGURAZIONE MIDDLEWARE (Ordine CRUCIALE)
// =========================================================

// A. Abilita CORS per il frontend
app.use(cors()); 

// B. STRIPE WEBHOOK (Deve stare PRIMA di express.json)
// Stripe ha bisogno del body "grezzo" (raw) per verificare la firma di sicurezza.
app.use("/webhooks-stripe", require("./routes/webhooks-stripe"));

// C. BODY PARSERS (Per tutto il resto del sito)
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// =========================================================
// 2. FRONTEND & DOCS
// =========================================================

// Serve TUTTI i file HTML nella cartella public (index.html, signup.html)
app.use(express.static(path.join(__dirname, "../public")));

// Serve la Documentazione Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));


// =========================================================
// 3. ROTTE PUBBLICHE (Senza API Key)
// =========================================================

// Health Check
app.get("/api-status", (req, res) => {
    res.json({ 
        status: "online", 
        version: "2.6.0", 
        environment: process.env.NODE_ENV || "development",
        message: "Pragma Enterprise API is running 🚀" 
    });
});

// Verifica Hash & Download
app.use("/verify", require("./routes/verify"));
app.use("/download", require("./routes/download"));

// NUOVA ROTTA: ISCRIZIONE & GENERAZIONE CHIAVI
// (Pubblica per permettere a chiunque di creare un account)
app.use("/onboarding", require("./routes/onboarding"));


// =========================================================
// 4. ROTTE PROTETTE (🔐 Richiedono API Key)
// =========================================================

app.use("/certify", requireApiKey, require("./routes/certify"));
app.use("/history", requireApiKey, require("./routes/history"));
app.use("/usage", requireApiKey, require("./routes/usage"));
app.use("/billing", requireApiKey, require("./routes/billing"));


// =========================================================
// 5. GESTIONE ERRORI GLOBALE
// =========================================================
app.use((err, req, res, next) => {
    console.error("🔥 Errore Server Non Gestito:", err.stack);
    res.status(500).json({ 
        error: "Internal Server Error", 
        message: "Si è verificato un errore imprevisto nel server.",
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

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
    📄 Docs:         http://localhost:${PORT}/api-docs
    
    🖥️  DASHBOARD:    http://localhost:${PORT}/index.html
    📝 REGISTRAZIONE: http://localhost:${PORT}/signup.html
    
    💳 Stripe:       Webhook attivo su /webhooks-stripe
    ==================================================
    `);
});

