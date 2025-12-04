const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pragma Enterprise API',
      version: '2.5.0', // Updated for Stripe & Billing Complete Integration
      description: `
### 🛡️ Trust Infrastructure for the AI Era
Pragma is the middleware API for notarizing digital assets on a Proprietary Blockchain.

**Key Features:**
* **Immutable Registry:** Smart Contract \`ContentCert\` on Sepolia.
* **AI Labeling:** On-chain classification (Human/AI/Mixed).
* **Smart Billing:** Automated credits & Stripe payments.
* **Legal Tech:** Instant PDF Certificates with Etherscan QR Codes.

**Billing Rules:**
* 🟡 **Write (POST /certify):** Consumes **1 Credit**.
* 🟢 **Read (GET /usage, /verify, /history):** Free (**0 Credits**).
* **Starter Plan:** Limited to 1000 requests. Upgrade via \`/billing\`.

---
**Quick Start:**
1. Click **Authorize** and paste your API Key.
2. Check your credits on \`/usage\`.
3. If you need to upgrade, call \`/billing/create-checkout-session\`.
      `,
      contact: {
        name: 'Pragma Developer Support',
        email: 'dev-support@pragma.io',
        url: 'https://pragma.io'
      },
      license: {
        name: 'Proprietary License',
        url: 'https://pragma.io/terms'
      }
    },
    servers: [
      {
        url: 'https://pragma-api.onrender.com',
        description: 'Production Server (Cloud)',
      },
      {
        url: 'http://localhost:3000',
        description: 'Development Server (Local)',
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'Enter your Enterprise API Key (e.g. pk_live...)'
        },
      },
      schemas: {
        // --- BILLING & USAGE ---
        UsageResponse: {
          type: 'object',
          properties: {
            client: { type: 'string', example: 'TechCorp Inc.' },
            plan: { type: 'string', example: 'Starter' },
            total_requests: { type: 'integer', example: 950, description: 'Credits consumed (writes only).' },
            limit: { type: 'string', example: 1000, description: 'Current plan limit.' },
            status: { type: 'string', example: 'active' }
          }
        },
        CheckoutSessionResponse: {
          type: 'object',
          properties: {
            url: { type: 'string', example: 'https://checkout.stripe.com/c/pay/cs_test_...', description: 'Redirect the user to this URL to complete the payment.' }
          }
        },
        // --- CERTIFICATION ---
        CertificationResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            hash: { type: 'string', example: '0x8f432b...', description: "SHA-256 Digital Fingerprint." },
            tx_hash: { type: 'string', example: '0xabc123...', description: "Blockchain Transaction Hash." },
            usage_billed_to: { type: 'string', example: 'cust_demo_enterprise' },
            data: { 
                type: 'object',
                properties: {
                    cert_id: { type: 'string' },
                    block_number: { type: 'integer' }
                }
            }
          }
        },
        // --- VERIFICATION ---
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
        // --- WEBHOOK PAYLOAD ---
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
        // --- ERRORS ---
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Unauthorized' },
            message: { type: 'string', example: 'Missing or invalid API Key.' }
          }
        },
        PaymentRequiredResponse: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Payment Required' },
            message: { type: 'string', example: 'Starter plan limit reached (1000 requests). Please upgrade.' }
          }
        }
      }
    },
    security: [
      { ApiKeyAuth: [] },
    ],
    // --- PATHS ---
    paths: {
      '/usage': {
        get: {
          summary: 'Check Usage & Plan',
          description: 'Returns account status and credit usage. Does NOT consume credits.',
          tags: ['Billing'],
          security: [{ ApiKeyAuth: [] }],
          responses: {
            200: {
              description: 'Usage status',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/UsageResponse' } } }
            },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/billing/create-checkout-session': {
        post: {
          summary: 'Upgrade Plan (Stripe)',
          description: 'Generates a Stripe Checkout URL to upgrade the account to Enterprise. Used by the dashboard button.',
          tags: ['Billing'],
          security: [{ ApiKeyAuth: [] }],
          requestBody: {
            content: { 'application/json': { schema: { type: 'object' } } }
          },
          responses: {
            200: {
              description: 'Payment URL generated',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/CheckoutSessionResponse' } } }
            },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/certify': {
        post: {
          summary: 'Certify Digital Asset (1 Credit)',
          description: 'Uploads a file and notarizes it on-chain. This call **CONSUMES 1 CREDIT**.',
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
                    file: { type: 'string', format: 'binary', description: 'File to certify' },
                    creator_wallet: { type: 'string', description: 'Optional creator wallet' },
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
                  summary: 'Webhook Notification',
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
              description: 'Certification successful',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/CertificationResponse' } } }
            },
            402: {
              description: 'Payment Required (Limit Reached)',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/PaymentRequiredResponse' } } }
            },
            409: { description: 'Conflict: File already certified' },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/verify/{hash}': {
        get: {
          summary: 'Verify on-chain (Free)',
          tags: ['Core'],
          security: [], 
          parameters: [ { in: 'path', name: 'hash', schema: { type: 'string' }, required: true } ],
          responses: {
            200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/VerificationResponse' } } } },
            404: { description: 'Not Found' }
          }
        }
      },
      '/download/{hash}': {
        get: {
          summary: 'Download Certificate PDF (Free)',
          tags: ['Tools'],
          security: [], 
          parameters: [ { in: 'path', name: 'hash', schema: { type: 'string' }, required: true } ],
          responses: {
            200: { content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } } },
            404: { description: 'Not Found' }
          }
        }
      },
      '/history/{clientId}': {
        get: {
          summary: 'Get History (Free)',
          tags: ['Analytics'],
          security: [{ ApiKeyAuth: [] }],
          parameters: [ { in: 'path', name: 'clientId', schema: { type: 'string' }, required: true } ],
          responses: {
            200: { description: 'List of certifications' }
          }
        }
      }
    }
  },
  apis: [], 
};

const specs = swaggerJsdoc(options);
module.exports = specs;