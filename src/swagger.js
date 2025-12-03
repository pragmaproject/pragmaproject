const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pragma Enterprise API',
      version: '2.2.1', // Patch version: Documentation Refinement
      description: `
### 🛡️ Trust Infrastructure for the AI Era
Pragma è l'API standard per la notarizzazione e certificazione di asset digitali su Blockchain Proprietaria.

**Funzionalità Enterprise:**
* **Smart Contract Registry:** Registro immutabile su Blockchain (Sepolia).
* **AI Labeling:** Classificazione (Human/AI) on-chain.
* **Smart Billing:** Sistema di crediti con Rate Limiting automatico.
* **Webhooks & PDF:** Notifiche real-time e certificati ufficiali.

**Regole di Fatturazione (Billing Rules):**
* 🟡 **Scrittura (POST /certify):** Consuma **1 Credito**.
* 🟢 **Lettura (GET /usage, /verify):** Gratuita (**0 Crediti**).
* **Piano Starter:** Limite rigido a 1000 Certificazioni.

---
**Quick Start:**
1. Clicca **Authorize** e inserisci la tua API Key (es. \`pk_live_123456789\`).
2. Usa \`/certify\` per caricare un file.
3. Controlla i tuoi consumi su \`/usage\`.
      `,
      contact: {
        name: 'Pragma Developer Support',
        email: 'dev-support@pragma.io',
        url: 'https://pragma.io'
      },
      license: {
        name: 'Enterprise Terms',
        url: 'https://pragma.io/terms'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Server di Sviluppo (Locale)',
      },
      {
        url: 'https://pragma-api.onrender.com',
        description: 'Server di Produzione (Cloud)',
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'Inserisci la tua Chiave API Enterprise (es. pk_live_...)'
        },
      },
      schemas: {
        // --- RISPOSTA USAGE ---
        UsageResponse: {
          type: 'object',
          properties: {
            client: { type: 'string', example: 'TechCorp Inc.' },
            plan: { type: 'string', example: 'Starter' },
            total_requests: { type: 'integer', example: 950, description: 'Crediti consumati (solo scritture).' },
            limit: { type: 'string', example: 1000, description: 'Limite del piano attivo.' },
            status: { type: 'string', example: 'active' }
          }
        },
        // --- RISPOSTA CERTIFICAZIONE ---
        CertificationResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            hash: { type: 'string', example: '0x8f432b...', description: "L'impronta digitale unica (SHA-256)." },
            tx_hash: { type: 'string', example: '0xabc123...', description: "Hash della transazione sul registro Smart Contract." },
            usage_billed_to: { type: 'string', example: 'cust_demo_enterprise' },
            data: { type: 'object' }
          }
        },
        // --- RISPOSTA VERIFICA ---
        VerificationResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'found' },
            source: { type: 'string', example: 'blockchain_confirmed' },
            hash: { type: 'string', example: '0x8f432b...' },
            creator: { type: 'string', example: '0x03454f6CdB45B55AFE58a86008B65e085028Bd31' },
            contentType: { type: 'integer', description: '0: Human, 1: AI, 2: Mixed' },
            timestamp: { type: 'string', example: '1701234567' }
          }
        },
        // --- PAYLOAD WEBHOOK ---
        WebhookPayload: {
          type: 'object',
          properties: {
            event: { type: 'string', example: 'certification.success' },
            created_at: { type: 'integer', example: 1701234567890 },
            data: {
              type: 'object',
              properties: {
                cert_id: { type: 'string', example: 'cert_1764...' },
                hash: { type: 'string', example: '0x8f432b...' },
                tx_hash: { type: 'string', example: '0xabc123...' },
                pdf_url: { type: 'string', example: 'https://api.pragma.io/download/0x8f43...' }
              }
            }
          }
        },
        // --- ERRORI ---
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        },
        PaymentRequiredResponse: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Payment Required' },
            message: { type: 'string', example: 'Hai raggiunto il limite del piano Starter (1000 richieste).' }
          }
        }
      }
    },
    security: [
      { ApiKeyAuth: [] },
    ],
    // --- ROTTE ---
    paths: {
      '/usage': {
        get: {
          summary: 'Controlla consumi e piano (Gratuito)',
          description: 'Restituisce lo stato dell\'account. Questa chiamata **NON** consuma crediti.',
          tags: ['Billing'],
          security: [{ ApiKeyAuth: [] }],
          responses: {
            200: {
              description: 'Stato consumi',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/UsageResponse' } } }
            },
            401: { description: 'Non autorizzato' }
          }
        }
      },
      '/certify': {
        post: {
          summary: 'Certifica un Asset Digitale (1 Credito)',
          description: 'Carica un file e lo notarizza. Questa chiamata **CONSUMA 1 CREDITO** dal piano cliente.',
          tags: ['Core'],
          security: [{ ApiKeyAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['file'],
                  properties: {
                    file: { type: 'string', format: 'binary' },
                    creator_wallet: { type: 'string' },
                    declared_type: { type: 'string', enum: ['human', 'ai', 'mixed'], default: 'human' }
                  }
                }
              }
            }
          },
          callbacks: {
            'certification.success': {
              '{$request.body.callbackUrl}': {
                post: {
                  summary: 'Notifica Webhook',
                  requestBody: {
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/WebhookPayload' } } }
                  },
                  responses: { '200': { description: 'OK' } }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Certificazione avviata',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/CertificationResponse' } } }
            },
            402: {
              description: 'Crediti Insufficienti (Upgrade richiesto)',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/PaymentRequiredResponse' } } }
            },
            409: { description: 'Conflitto: File già certificato (Nessun addebito)' },
            401: { description: 'Non autorizzato' }
          }
        }
      },
      '/verify/{hash}': {
        get: {
          summary: 'Verifica (Gratuito)',
          tags: ['Core'],
          security: [], 
          parameters: [ { in: 'path', name: 'hash', schema: { type: 'string' }, required: true } ],
          responses: {
            200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/VerificationResponse' } } } },
            404: { description: 'Non trovato' }
          }
        }
      },
      '/download/{hash}': {
        get: {
          summary: 'Scarica PDF (Gratuito)',
          tags: ['Tools'],
          security: [], 
          parameters: [ { in: 'path', name: 'hash', schema: { type: 'string' }, required: true } ],
          responses: {
            200: { content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } } },
            404: { description: 'Non trovato' }
          }
        }
      },
      '/history/{clientId}': {
        get: {
          summary: 'Storico Certificazioni (Gratuito)',
          tags: ['Analytics'],
          security: [{ ApiKeyAuth: [] }],
          parameters: [ { in: 'path', name: 'clientId', schema: { type: 'string' }, required: true } ],
          responses: {
            200: { description: 'Lista certificazioni' }
          }
        }
      }
    }
  },
  apis: [], 
};

const specs = swaggerJsdoc(options);
module.exports = specs;