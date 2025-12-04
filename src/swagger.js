const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pragma Enterprise API',
      version: '2.7.0', // Updated for Strict Pay-to-Play
      description: `
### 🛡️ Trust Infrastructure for the AI Era
Pragma is the middleware API for notarizing digital assets on a Proprietary Blockchain.

**Key Features:**
* **Immutable Registry:** Smart Contract \`ContentCert\` on Sepolia.
* **AI Labeling:** On-chain classification (Human/AI/Mixed).
* **Smart Billing:** Automated credits & Stripe payments.
* **Self-Service:** Instant API Key generation via API or Dashboard.

**Billing Rules:**
* 🟡 **Write (POST /certify):** Consumes **1 Credit**.
* 🟢 **Read (GET /usage, /verify, /history):** Free (**0 Credits**).
* **Starter Plan:** Limited to 1000 requests.
* **Enterprise Plan:** Unlimited. Requires active subscription. **Keys are inactive until payment is completed.**

---
**Quick Start:**
1. **No Account?** Use \`/onboarding/register\` to get an API Key immediately.
2. **Have a Key?** Click **Authorize** above.
3. **Start:** Upload a file via \`/certify\`.
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
        // --- ONBOARDING ---
        OnboardingRequest: {
          type: 'object',
          required: ['name', 'email', 'plan'],
          properties: {
            name: { type: 'string', example: 'TechCorp Inc.' },
            email: { type: 'string', format: 'email', example: 'dev@techcorp.com' },
            plan: { type: 'string', enum: ['Starter', 'Enterprise'], example: 'Starter' }
          }
        },
        OnboardingResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            apiKey: { type: 'string', example: 'pk_live_a1b2c3d4...' },
            clientId: { type: 'string', example: 'cust_xyz123' },
            redirectUrl: { type: 'string', nullable: true, description: 'Stripe Checkout URL. If present, payment is required to activate the key.' }
          }
        },
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
            url: { type: 'string', example: 'https://checkout.stripe.com/c/pay/cs_test_...', description: 'Redirect URL.' }
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
            data: { type: 'object' }
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
        ForbiddenResponse: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Forbidden' },
            message: { type: 'string', example: 'Account not active. Complete payment to enable this API Key.' }
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
      '/onboarding/register': {
        post: {
          summary: 'Create new Account (Public)',
          description: 'Generates a new Client ID and API Key. If Enterprise plan is selected, key will remain inactive until payment.',
          tags: ['Onboarding'],
          security: [], // Public
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/OnboardingRequest' } } }
          },
          responses: {
            200: {
              description: 'Account created',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/OnboardingResponse' } } }
            },
            409: { description: 'Email already registered' }
          }
        }
      },
      '/usage': {
        get: {
          summary: 'Check Usage & Plan',
          tags: ['Billing'],
          security: [{ ApiKeyAuth: [] }],
          responses: {
            200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/UsageResponse' } } } },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden (Account Inactive)', content: { 'application/json': { schema: { $ref: '#/components/schemas/ForbiddenResponse' } } } }
          }
        }
      },
      '/billing/create-checkout-session': {
        post: {
          summary: 'Upgrade Plan (Stripe)',
          tags: ['Billing'],
          security: [{ ApiKeyAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
          responses: {
            200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CheckoutSessionResponse' } } } },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden' }
          }
        }
      },
      '/certify': {
        post: {
          summary: 'Certify Digital Asset (1 Credit)',
          tags: ['Core'],
          security: [{ ApiKeyAuth: [] }],
          requestBody: {
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
                  summary: 'Webhook Notification',
                  requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/WebhookPayload' } } } },
                  responses: { '200': { description: 'OK' } }
                }
              }
            }
          },
          responses: {
            200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CertificationResponse' } } } },
            402: { description: 'Payment Required', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaymentRequiredResponse' } } } },
            403: { description: 'Forbidden (Inactive)', content: { 'application/json': { schema: { $ref: '#/components/schemas/ForbiddenResponse' } } } },
            409: { description: 'Conflict' },
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
            200: { description: 'List of certifications' },
            403: { description: 'Forbidden (Inactive)' }
          }
        }
      }
    }
  },
  apis: [], 
};

const specs = swaggerJsdoc(options);
module.exports = specs;