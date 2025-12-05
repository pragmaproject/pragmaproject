🛡️ Pragma Enterprise API

The Trust Layer for the AI Era. > Blockchain Notarization Infrastructure for Enterprise, Legal Tech, and AI Platforms.

📖 Overview

Pragma is a middleware API that allows any software to notarize digital assets on a public Blockchain (Ethereum/Sepolia) via a simple REST interface.

Unlike simple transaction-based notarization, Pragma uses a Proprietary Smart Contract (ContentCert) to create an immutable registry of ownership, timestamps, and content types (Human vs AI).

✨ Key Features

⛓️ Smart Contract Registry: Immutable proof of existence and ownership on Sepolia Testnet.

🤖 AI Labeling: On-chain classification for AI Act compliance (Human, AI, Mixed).

📄 Legal Output: Automatic generation of PDF Certificates with Etherscan verification QR Codes.

⚡ Event-Driven: Webhook system for real-time server-to-server notifications.

💰 Smart Billing: Built-in Rate Limiting, API Key management, and Stripe Integration.

🔒 Zero-Data Privacy: We never store your files. We only process the cryptographic hash.

🏗️ Architecture

Backend: Node.js / Express (Enterprise-grade structure)

Database: Supabase (PostgreSQL) for off-chain indexing & billing.

Blockchain: Hardhat / Ethers.js connecting to Sepolia Testnet.

Docs: Swagger/OpenAPI 3.0 auto-generated documentation.

🚀 Quick Start

1. Get an API Key (Self-Service)

You can generate a key immediately using our onboarding portal:
👉 https://pragma-api.onrender.com/signup.html

Starter Plan: Free, limited to 1000 requests.

Enterprise Plan: Unlimited, requires Stripe subscription.

2. Access the Dashboard

Test the API visually using our developer dashboard:
👉 https://pragma-api.onrender.com/index.html

3. Read the Docs

Full API documentation (Swagger) with code examples:
👉 https://pragma-api.onrender.com/api-docs

💻 Local Development

Prerequisites

Node.js v18+

Supabase Account

Stripe Account (Test Mode)

Alchemy/Infura API Key (for Sepolia)

Installation

Clone the repo

git clone [https://github.com/YOUR_USERNAME/pragma-api.git](https://github.com/YOUR_USERNAME/pragma-api.git)
cd pragma-api


Install dependencies

npm install


Configure Environment
Create a .env file based on the example:

PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_service_role_key
PRIVATE_KEY=your_wallet_private_key
ALCHEMY_API_KEY=your_alchemy_key
CONTRACT_ADDRESS=0x... (Deployed Contract Address)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:3000/index.html


Run the Server

npm start


🔒 Security & Privacy

API Keys: All write operations require a valid x-api-key header.

Rate Limiting: Starter plans are hard-capped at 1000 requests.

Zero-Knowledge: Pragma NEVER stores the original files. Only the SHA-256 Hash is stored on-chain and in our database.

Strict Billing: Enterprise keys are created in an Inactive state and activated only upon successful Stripe payment confirmation via Webhook.