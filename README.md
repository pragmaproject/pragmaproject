# 🛡️ Pragma Enterprise API
> **The Trust Layer for the AI Era.** > Blockchain Notarization Infrastructure for Enterprise, Legal Tech, and AI Platforms.

![Status](https://img.shields.io/badge/Status-Production_Ready-green)
![Version](https://img.shields.io/badge/Version-2.2.1-blue)
![License](https://img.shields.io/badge/License-Proprietary-orange)

## 📖 Overview
Pragma is a middleware API that allows any software to **notarize digital assets** on a public Blockchain (Ethereum/Sepolia) via a simple REST interface.

Unlike simple transaction-based notarization, Pragma uses a **Proprietary Smart Contract** (`ContentCert`) to create an immutable registry of ownership, timestamps, and content types (Human vs AI).

## ✨ Key Features
* **⛓️ Smart Contract Registry:** Immutable proof of existence and ownership.
* **🤖 AI Labeling:** On-chain classification for AI Act compliance (`Human`, `AI`, `Mixed`).
* **📄 Legal Output:** Automatic generation of PDF Certificates with verification QR Codes.
* **⚡ Event-Driven:** Webhook system for real-time server-to-server notifications.
* **💰 Smart Billing:** Built-in Rate Limiting, API Key management, and Usage Tracking.

## 🏗️ Architecture
* **Backend:** Node.js / Express (Enterprise-grade structure)
* **Database:** Supabase (PostgreSQL) for off-chain indexing & billing.
* **Blockchain:** Hardhat / Ethers.js connecting to Sepolia Testnet.
* **Docs:** Swagger/OpenAPI 3.0 auto-generated documentation.

## 🚀 Quick Start (Local Development)

### Prerequisites
* Node.js v18+
* Supabase Account
* Alchemy/Infura API Key (for Sepolia)

### Installation
1.  **Clone the repo**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/pragma-api.git](https://github.com/YOUR_USERNAME/pragma-api.git)
    cd pragma-api
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file based on the example:
    ```env
    PORT=3000
    SUPABASE_URL=your_supabase_url
    SUPABASE_KEY=your_service_role_key
    PRIVATE_KEY=your_wallet_private_key
    ALCHEMY_API_KEY=your_alchemy_key
    CONTRACT_ADDRESS=0x... (Deployed Contract Address)
    ```

4.  **Run the Server**
    ```bash
    npm start
    ```

## 📚 Documentation
Full API documentation (Swagger) is available at:
👉 **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

## 🧪 Testing
You can use the built-in **Developer Dashboard** to test certification and verification flows visually.
Go to: `http://localhost:3000/index.html`

## 🔒 Security
* **API Keys:** All write operations require a valid `x-api-key` header.
* **Rate Limiting:** Starter plans are capped at 1000 requests.
* **Privacy:** Pragma **NEVER** stores the original files. Only the SHA-256 Hash is stored on-chain and in our database.

## 📝 License
Copyright © 2025 Pragma Inc. All rights reserved.