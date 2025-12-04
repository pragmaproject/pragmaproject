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
// Se mettessimo express.json() prima, corromperebbe i dati del webhook.
app.use("/webhooks-stripe", require("./routes/webhooks-stripe"));

// C. BODY PARSERS (Per tutto il resto del sito)
// Ora possiamo convertire i body in JSON per le altre rotte
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// =========================================================
// 2. FRONTEND & DOCS
// =========================================================

// Serve la Dashboard HTML
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
        version: "2.4.0", 
        environment: process.env.NODE_ENV || "development",
        message: "Pragma Enterprise API is running 🚀" 
    });
});

// Verifica Hash (Chiunque deve poter verificare)
app.use("/verify", require("./routes/verify"));

// Download PDF (Link pubblico per facilitare la condivisione)
app.use("/download", require("./routes/download"));


// =========================================================
// 4. ROTTE PROTETTE (🔐 Richiedono API Key)
// =========================================================

// Certificazione (Scrittura su Blockchain - A pagamento)
app.use("/certify", requireApiKey, require("./routes/certify"));

// Storico Certificazioni
app.use("/history", requireApiKey, require("./routes/history"));

// Controllo Consumi (Billing)
app.use("/usage", requireApiKey, require("./routes/usage"));

// Pagamenti Stripe (Creazione Link)
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
    🖥️  Dashboard:    http://localhost:${PORT}
    💳 Stripe:       Webhook attivo su /webhooks-stripe
    ==================================================
    `);
});

