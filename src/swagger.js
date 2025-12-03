const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pragma Enterprise API',
      version: '2.2.0', // Aggiornamento Major per Billing & Rate Limiting
      description: `
### 🛡️ Trust Infrastructure for the AI Era
Pragma è l'API standard per la notarizzazione e certificazione di asset digitali su Blockchain Proprietaria.

**Funzionalità Enterprise:**
* **Smart Contract Registry:** Registro immutabile su Blockchain (Sepolia).
* **AI Labeling:** Classificazione (Human/AI) on-chain.
* **Smart Billing:** Sistema di crediti con Rate Limiting automatico.
* **Webhooks & PDF:** Notifiche real-time e certificati ufficiali.

**Regole di Fatturazione:**
* **Scrittura (POST /certify):** Consuma 1 Credito.
* **Lettura (GET):** Gratuita (Unlimited).
* **Piano Starter:** Max 1000 Certificazioni totali.

---
**Quick Start:**
1. Clicca **Authorize** e inserisci la tua API Key.
2. Controlla i tuoi crediti su \`/usage\`.
3. Certifica un file su \`/certify\`.
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
            total_requests: { type: 'integer', example: 950, description: 'Crediti consumati.' },
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
            tx_hash: { type: 'string', example: '0xabc123...', description: "Transazione su Blockchain." },
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
            creator: { type: 'string', example: '0x123...' },
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
                cert_id: { type: 'string' },
                hash: { type: 'string' },
                tx_hash: { type: 'string' },
                pdf_url: { type: 'string' }
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
          summary: 'Controlla consumi e piano',
          description: 'Restituisce lo stato dell\'account. Non consuma crediti.',
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
          description: 'Carica un file e lo notarizza. Consuma 1 credito dal piano cliente.',
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
            409: { description: 'File già certificato' },
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