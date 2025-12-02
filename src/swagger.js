const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pragma Enterprise API',
      version: '1.0.0',
      description: `
### 🛡️ Trust Infrastructure for the AI Era
Pragma è l'API standard per la notarizzazione e certificazione di asset digitali su Blockchain.

**Caratteristiche Principali:**
* **Immutabilità:** Ogni file riceve un timestamp certo su Blockchain (Sepolia/Ethereum).
* **Verificabilità:** Chiunque può verificare l'integrità del contenuto tramite Hash.
* **Certificati Ufficiali:** Generazione automatica di certificati PDF con QR Code verificabile.

---
**Come iniziare:**
1. Ottieni una **API Key** contattando il team sales.
2. Usa il bottone **Authorize** qui sotto e inserisci la chiave (es. \`pk_live_123456789\`).
3. Prova l'endpoint \`/certify\` caricando un file.
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
        CertificationResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            hash: { type: 'string', example: '0x8f432b...' },
            tx_hash: { type: 'string', example: '0xabc123...' },
            usage_billed_to: { type: 'string', example: 'cust_demo_enterprise' },
            data: { type: 'object' }
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
          description: 'Carica un file e lo notarizza sulla Blockchain. Restituisce Hash e TX ID.',
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
                      description: '(Opzionale) Wallet del creatore.'
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
          responses: {
            200: {
              description: 'Successo',
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
              description: "L'hash esadecimale (es. 0x...)"
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
      '/download/{hash}': {  // <--- ECCO LA NUOVA SEZIONE
        get: {
          summary: 'Scarica Certificato PDF',
          description: 'Genera e scarica un certificato ufficiale in PDF con QR Code.',
          tags: ['Download'],
          security: [], // Public download
          parameters: [
            {
              in: 'path',
              name: 'hash',
              schema: { type: 'string' },
              required: true,
              description: "L'hash del file certificato"
            }
          ],
          responses: {
            200: {
              description: 'Il file PDF del certificato',
              content: {
                'application/pdf': {
                  schema: {
                    type: 'string',
                    format: 'binary'
                  }
                }
              }
            },
            404: {
              description: 'Certificato non trovato'
            }
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
            200: {
              description: 'Lista certificazioni'
            }
          }
        }
      }
    }
  },
  apis: [], 
};

const specs = swaggerJsdoc(options);
module.exports = specs;