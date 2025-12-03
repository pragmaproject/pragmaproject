const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pragma Enterprise API',
      version: '1.1.0',
      description: `
### 🛡️ Trust Infrastructure for the AI Era
Pragma è l'API standard per la notarizzazione e certificazione di asset digitali su Blockchain.

**Funzionalità Enterprise:**
* **Immutabilità:** Timestamp certo su Blockchain (Sepolia/Ethereum).
* **Verificabilità:** Verifica integrità tramite Hash SHA-256.
* **Certificati PDF:** Generazione automatica certificati ufficiali.
* **Webhooks (Event-Driven):** Notifiche in tempo reale server-to-server al completamento della transazione.

---
**Quick Start:**
1. Clicca **Authorize** e inserisci la tua API Key (es. \`pk_live_123456789\`).
2. Usa \`/certify\` per caricare un file.
3. Se hai configurato un Webhook, riceverai una POST request automatica al termine.
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
          description: 'Inserisci la tua Chiave API (es. pk_live_...)'
        },
      },
      schemas: {
        // RISPOSTA STANDARD CERTIFY
        CertificationResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            hash: { type: 'string', example: '0x8f432b...', description: "Hash SHA-256 del contenuto" },
            tx_hash: { type: 'string', example: '0xabc123...', description: "Transazione Blockchain (Pending o Confirmed)" },
            usage_billed_to: { type: 'string', example: 'cust_demo_enterprise' },
            data: { type: 'object' }
          }
        },
        // STRUTTURA DEL WEBHOOK (Quello che riceve il cliente)
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
                block: { type: 'integer', example: 5432109 },
                pdf_url: { type: 'string', example: 'https://api.pragma.io/download/0x8f43...' }
              }
            }
          }
        },
        VerificationResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'found' },
            source: { type: 'string', example: 'blockchain_confirmed' },
            hash: { type: 'string', example: '0x8f432b...' },
            creator: { type: 'string', example: '0x123...' },
            timestamp: { type: 'string', example: '1701234567' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    },
    security: [
      { ApiKeyAuth: [] },
    ],
    paths: {
      '/certify': {
        post: {
          summary: 'Certifica un nuovo file',
          description: 'Carica un file e avvia la notarizzazione. Se configurato, invia un Webhook al termine.',
          tags: ['Certificazione'],
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
                      description: 'Il documento da certificare.'
                    },
                    creator_wallet: {
                      type: 'string',
                      description: 'Wallet del creatore (Opzionale).'
                    },
                    declared_type: {
                      type: 'string',
                      enum: ['human', 'ai', 'mixed'],
                      default: 'human'
                    }
                  }
                }
              }
            }
          },
          // QUI DOCUMENTIAMO IL WEBHOOK (CALLBACK)
          callbacks: {
            'certification.success': {
              '{$request.body.callbackUrl}': {
                post: {
                  summary: 'Notifica Webhook (Inviata dal Server)',
                  description: 'Questa richiesta viene inviata al server del cliente quando la blockchain conferma la transazione.',
                  requestBody: {
                    required: true,
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/WebhookPayload'
                        }
                      }
                    }
                  },
                  responses: {
                    '200': {
                      description: 'Il tuo server deve rispondere 200 OK per confermare la ricezione'
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Richiesta accettata',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/CertificationResponse' } } }
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
          summary: 'Verifica tramite Hash',
          description: 'Endpoint pubblico. Restituisce i metadati blockchain di un file.',
          tags: ['Verifica'],
          security: [],
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
              description: 'Trovato',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/VerificationResponse' } } }
            },
            404: {
              description: 'Non trovato'
            }
          }
        }
      },
      '/download/{hash}': {
        get: {
          summary: 'Scarica Certificato PDF',
          description: 'Scarica il certificato ufficiale con QR Code.',
          tags: ['Download'],
          security: [],
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
              description: 'File PDF',
              content: {
                'application/pdf': {
                  schema: { type: 'string', format: 'binary' }
                }
              }
            },
            404: { description: 'Non trovato' }
          }
        }
      },
      '/history/{clientId}': {
        get: {
          summary: 'Recupera storico cliente',
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