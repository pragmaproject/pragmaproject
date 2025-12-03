const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pragma Enterprise API',
      version: '2.1.0', // Minor version update per le feature di billing
      description: `
### 🛡️ Trust Infrastructure for the AI Era
Pragma è l'API standard per la notarizzazione e certificazione di asset digitali su Blockchain Proprietaria.

**Funzionalità Enterprise:**
* **Immutabilità:** Timestamp certo su Blockchain (Sepolia/Ethereum).
* **Verificabilità:** Verifica integrità tramite Hash SHA-256.
* **Certificati PDF:** Generazione automatica certificati ufficiali.
* **Webhooks:** Notifiche in tempo reale server-to-server.
* **Usage Tracking:** Monitoraggio trasparente dei consumi e dei limiti.

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
          description: 'Inserisci la tua Chiave API Enterprise'
        },
      },
      schemas: {
        // --- RISPOSTA USAGE (BILLING) ---
        UsageResponse: {
          type: 'object',
          properties: {
            client: { type: 'string', example: 'TechCorp Inc.' },
            plan: { type: 'string', example: 'Enterprise' },
            total_requests: { type: 'integer', example: 1250, description: 'Numero totale di chiamate API effettuate' },
            limit: { type: 'string', example: 'Unlimited' },
            status: { type: 'string', example: 'active' }
          }
        },
        // --- RISPOSTA CERTIFICAZIONE ---
        CertificationResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            hash: { type: 'string', example: '0x8f432b...', description: "L'impronta digitale unica (SHA-256) del file." },
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
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Unauthorized' },
            message: { type: 'string', example: 'API Key mancante o non valida.' }
          }
        }
      }
    },
    security: [
      { ApiKeyAuth: [] },
    ],
    // --- ROTTE ---
    paths: {
      '/usage': {  // <--- NUOVA ROTTA BILLING
        get: {
          summary: 'Controlla consumi e piano',
          description: 'Restituisce il numero di chiamate effettuate e il piano tariffario attivo.',
          tags: ['Billing'],
          security: [{ ApiKeyAuth: [] }],
          responses: {
            200: {
              description: 'Stato attuale dei consumi',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/UsageResponse' } } }
            },
            401: { description: 'Non autorizzato' }
          }
        }
      },
      '/certify': {
        post: {
          summary: 'Certifica un Asset Digitale',
          description: 'Carica un file, calcola l\'hash e lo registra sul contratto ContentCert. Supporta la dichiarazione AI/Human.',
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
                    file: {
                      type: 'string',
                      format: 'binary',
                      description: 'Il documento, immagine o video da certificare.'
                    },
                    creator_wallet: {
                      type: 'string',
                      description: 'Wallet proprietario del contenuto (Opzionale).'
                    },
                    declared_type: {
                      type: 'string',
                      enum: ['human', 'ai', 'mixed'],
                      default: 'human',
                      description: 'Origine del contenuto: Umano (0), AI (1) o Misto (2).'
                    }
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
                  description: 'Viene inviata al tuo server quando la transazione è confermata.',
                  requestBody: {
                    content: {
                      'application/json': {
                        schema: { $ref: '#/components/schemas/WebhookPayload' }
                      }
                    }
                  },
                  responses: { '200': { description: 'OK' } }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Certificazione avviata con successo',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/CertificationResponse' } } }
            },
            409: { description: 'Conflitto: File già certificato' },
            401: { description: 'Non autorizzato' }
          }
        }
      },
      '/verify/{hash}': {
        get: {
          summary: 'Verifica autenticità (On-Chain)',
          tags: ['Core'],
          security: [], // Pubblico
          parameters: [
            {
              in: 'path',
              name: 'hash',
              schema: { type: 'string' },
              required: true,
              description: "Hash esadecimale (es. 0x...)"
            }
          ],
          responses: {
            200: {
              description: 'Certificazione trovata',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/VerificationResponse' } } }
            },
            404: { description: 'Non trovato' }
          }
        }
      },
      '/download/{hash}': {
        get: {
          summary: 'Scarica Certificato PDF',
          tags: ['Tools'],
          security: [], // Pubblico
          parameters: [
            {
              in: 'path',
              name: 'hash',
              schema: { type: 'string' },
              required: true
            }
          ],
          responses: {
            200: {
              description: 'File PDF binario',
              content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } }
            },
            404: { description: 'Non trovato' }
          }
        }
      },
      '/history/{clientId}': {
        get: {
          summary: 'Storico Certificazioni',
          tags: ['Analytics'],
          security: [{ ApiKeyAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'clientId',
              schema: { type: 'string' },
              required: true
            }
          ],
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