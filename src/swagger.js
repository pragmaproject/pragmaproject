const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pragma Enterprise API',
      version: '1.0.0',
      description: 'API di Notarizzazione Blockchain per Enterprise. Permette di certificare l\'esistenza, l\'integrità e la paternità di qualsiasi file digitale.',
      contact: {
        name: 'Supporto Pragma',
        email: 'support@pragma.io',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Server di Sviluppo',
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
    },
    security: [
      {
        ApiKeyAuth: [],
      },
    ],
    // DEFINIAMO I PERCORSI QUI (PIÙ SICURO DEI COMMENTI YAML)
    paths: {
      '/certify': {
        post: {
          summary: 'Certifica un file su Blockchain',
          tags: ['Core'],
          security: [{ ApiKeyAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    file: {
                      type: 'string',
                      format: 'binary',
                      description: 'Il file da certificare'
                    },
                    creator_wallet: {
                      type: 'string',
                      description: 'Wallet del creatore originale'
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
              description: 'Certificazione avvenuta con successo',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      hash: { type: 'string' },
                      tx_hash: { type: 'string' },
                      data: { type: 'object' }
                    }
                  }
                }
              }
            },
            401: {
              description: 'Non autorizzato (API Key mancante o invalida)'
            }
          }
        }
      },
      '/verify/{hash}': {
        get: {
          summary: 'Verifica un hash (Pubblico)',
          description: 'Controlla se un hash esiste sulla blockchain.',
          tags: ['Core'],
          security: [], // Rimuove la sicurezza per questa rotta pubblica
          parameters: [
            {
              in: 'path',
              name: 'hash',
              schema: { type: 'string' },
              required: true,
              description: "L'hash del file (es. 0x...)"
            }
          ],
          responses: {
            200: {
              description: 'Certificazione trovata',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string' },
                      source: { type: 'string' },
                      timestamp: { type: 'string' }
                    }
                  }
                }
              }
            },
            404: {
              description: 'Certificazione non trovata'
            }
          }
        }
      },
      '/history/{clientId}': {
        get: {
          summary: 'Ottieni lo storico certificazioni',
          tags: ['Core'],
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
              description: 'Lista certificazioni trovate'
            }
          }
        }
      }
    }
  },
  // Lasciamo l'array vuoto perché abbiamo definito tutto sopra manualmente
  apis: [], 
};

const specs = swaggerJsdoc(options);
module.exports = specs;