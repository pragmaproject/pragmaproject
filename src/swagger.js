const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pragma Enterprise API',
      version: '1.0.0', // Versione API
      description: `
### 🛡️ Trust Infrastructure for the AI Era
Pragma è l'API standard per la notarizzazione e certificazione di asset digitali su Blockchain.

**Caratteristiche Principali:**
* **Immutabilità:** Ogni file riceve un timestamp certo su Blockchain (Sepolia/Ethereum).
* **Verificabilità:** Chiunque può verificare l'integrità del contenuto tramite Hash.
* **Privacy:** Il contenuto originale non viene mai salvato pubblicamente, solo la sua impronta crittografica (Hash).

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
      },
      license: {
        name: 'Enterprise License',
        url: 'https://pragma.io/license'
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
      // DEFINIZIONE MODELLI DATI (Per far vedere la struttura JSON)
      schemas: {
        CertificationResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            hash: { type: 'string', example: '0x8f432b...', description: "L'impronta digitale SHA-256 del file" },
            tx_hash: { type: 'string', example: '0xabc123...', description: "L'hash della transazione su Blockchain" },
            usage_billed_to: { type: 'string', example: 'cust_demo_enterprise' },
            data: {
              type: 'object',
              properties: {
                cert_id: { type: 'string', example: 'cert_176435...' },
                block_number: { type: 'integer', example: 5432109 },
                metadata: {
                   type: 'object',
                   properties: {
                      fileName: { type: 'string', example: 'contratto.pdf' },
                      sizeBytes: { type: 'integer', example: 102400 }
                   }
                }
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
            declared_type: { type: 'string', example: 'human' },
            timestamp: { type: 'string', example: '1701234567' }
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
    // --- DEFINIZIONE ROTTE ---
    paths: {
      '/certify': {
        post: {
          summary: 'Certifica un nuovo file',
          description: 'Carica un file, calcola il suo hash SHA-256 e lo notarizza sulla Blockchain. Richiede API Key.',
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
                      description: 'Il documento, immagine o video da certificare.'
                    },
                    creator_wallet: {
                      type: 'string',
                      example: '0x03454f6CdB45B55AFE58a86008B65e085028Bd31',
                      description: '(Opzionale) L\'indirizzo wallet del creatore del contenuto.'
                    },
                    declared_type: {
                      type: 'string',
                      enum: ['human', 'ai', 'mixed'],
                      default: 'human',
                      description: 'Dichiara se il contenuto è fatto da Umani o AI.'
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Certificazione completata con successo',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/CertificationResponse' } } }
            },
            400: {
              description: 'Richiesta non valida (File mancante)',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            },
            401: {
              description: 'Non autorizzato (API Key errata)',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
            }
          }
        }
      },
      '/verify/{hash}': {
        get: {
          summary: 'Verifica autenticità tramite Hash',
          description: 'Endpoint pubblico. Controlla se un hash esiste sulla blockchain e restituisce i metadati associati.',
          tags: ['Verifica'],
          security: [], // Public
          parameters: [
            {
              in: 'path',
              name: 'hash',
              schema: { type: 'string' },
              required: true,
              description: "L'hash esadecimale (es. 0x...) del file da verificare",
              example: "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
            }
          ],
          responses: {
            200: {
              description: 'Certificazione trovata',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/VerificationResponse' } } }
            },
            404: {
              description: 'Certificazione non trovata',
              content: { 'application/json': { schema: { example: { status: "not_found", message: "Hash non trovato" } } } }
            }
          }
        }
      },
      '/history/{clientId}': {
        get: {
          summary: 'Recupera lo storico di un cliente',
          tags: ['Analytics'],
          security: [{ ApiKeyAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'clientId',
              schema: { type: 'string' },
              required: true,
              example: 'cust_demo_enterprise'
            }
          ],
          responses: {
            200: {
              description: 'Lista delle certificazioni',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      count: { type: 'integer' },
                      certifications: { type: 'array', items: { type: 'object' } } // Si potrebbe dettagliare meglio
                    }
                  }
                }
              }
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