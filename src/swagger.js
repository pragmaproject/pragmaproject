const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pragma Enterprise API',
      version: '2.0.0', // Major version update per il nuovo Smart Contract
      description: `
### 🛡️ Trust Infrastructure for the AI Era
Pragma è l'API standard per la notarizzazione e certificazione di asset digitali su Blockchain Proprietaria.

**Core Features:**
* **Smart Contract Registry:** Ogni certificazione è registrata nel contratto \`ContentCert\` su Sepolia.
* **AI Labeling:** Classificazione immutabile del contenuto (Human vs AI).
* **Proof of Ownership:** Associa indissolubilmente il Wallet del creatore al contenuto.
* **Enterprise Ready:** Webhooks, PDF ufficiali e API Key security.

---
**Quick Start:**
1. Clicca **Authorize** e inserisci la tua API Key (es. \`pk_live_123456789\`).
2. Usa \`/certify\` per caricare un file e definire se è AI o Umano.
3. Scarica il certificato PDF da \`/download\`.
      `,
      contact: {
        name: 'Pragma Developer Support',
        email: 'dev-support@pragma.io',
        url: 'https://pragma.io'
      },
      license: {
        name: 'Pragma Enterprise License',
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
          description: 'Inserisci la tua Chiave API Enterprise'
        },
      },
      schemas: {
        // --- RISPOSTA CERTIFICAZIONE ---
        CertificationResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            hash: { type: 'string', example: '0x8f432b...', description: "L'impronta digitale unica (SHA-256) del file." },
            tx_hash: { type: 'string', example: '0xabc123...', description: "Hash della transazione sul registro Smart Contract." },
            usage_billed_to: { type: 'string', example: 'cust_demo_enterprise' },
            data: {
              type: 'object',
              description: 'Dettagli salvati nel database off-chain.',
              properties: {
                cert_id: { type: 'string' },
                metadata: { type: 'object' }
              }
            }
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
                      description: 'Wallet proprietario del contenuto (Opzionale, default: System Wallet).'
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
            409: {
              description: 'Conflitto: Il file è già stato certificato in precedenza.',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            },
            401: {
              description: 'Non autorizzato',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/verify/{hash}': {
        get: {
          summary: 'Verifica autenticità (On-Chain)',
          description: 'Interroga direttamente lo Smart Contract per verificare l\'esistenza e i metadati di un hash.',
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
            404: {
              description: 'Non trovato sul registro Blockchain'
            }
          }
        }
      },
      '/download/{hash}': {
        get: {
          summary: 'Scarica Certificato PDF',
          description: 'Genera al volo un certificato PDF ufficiale con QR Code di verifica.',
          tags: ['Tools'],
          security: [], // Pubblico per facilitare la condivisione
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
              content: {
                'application/pdf': {
                  schema: { type: 'string', format: 'binary' }
                }
              }
            },
            404: { description: 'Certificato non trovato' }
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
            200: { description: 'Lista completa delle certificazioni effettuate' }
          }
        }
      }
    }
  },
  apis: [], 
};

const specs = swaggerJsdoc(options);
module.exports = specs;