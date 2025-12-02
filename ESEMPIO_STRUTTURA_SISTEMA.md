# 📋 Esempio Struttura Sistema Completo

## Sistema: Content Cert Chain - Enterprise Platform

---

## 1️⃣ CLIENTI (Aziende / Piattaforme)

### Cliente #001
```
ID: cust_abc123xyz
Nome: TechCorp Solutions
Email: admin@techcorp.com
Tipo: Azienda
Stato: Attivo
Data Registrazione: 2025-11-15T10:30:00Z
Piano: Enterprise
Limite Mensile: 10000 certificazioni
Certificazioni Usate: 3421
Certificazioni Rimanenti: 6579
Indirizzo Wallet: 0xTechCorpWallet123...
API Keys Attive: 3
Ultimo Accesso: 2025-11-28T17:45:00Z
```

### Cliente #002
```
ID: cust_def456uvw
Nome: MediaPlatform Inc
Email: contact@mediaplatform.io
Tipo: Piattaforma
Stato: Attivo
Data Registrazione: 2025-11-20T14:20:00Z
Piano: Professional
Limite Mensile: 5000 certificazioni
Certificazioni Usate: 1890
Certificazioni Rimanenti: 3110
Indirizzo Wallet: 0xMediaPlatformWallet456...
API Keys Attive: 2
Ultimo Accesso: 2025-11-28T16:30:00Z
```

### Cliente #003
```
ID: cust_ghi789rst
Nome: ContentVerify Ltd
Email: support@contentverify.com
Tipo: Azienda
Stato: Sospeso
Data Registrazione: 2025-10-05T09:15:00Z
Piano: Starter
Limite Mensile: 1000 certificazioni
Certificazioni Usate: 1000
Certificazioni Rimanenti: 0
Indirizzo Wallet: 0xContentVerifyWallet789...
API Keys Attive: 1
Ultimo Accesso: 2025-11-25T12:00:00Z
Motivo Sospensione: Limite mensile raggiunto
```

---

## 2️⃣ API KEYS

### API Key #001
```
Key ID: key_live_sk_abc123xyz789
Cliente: cust_abc123xyz (TechCorp Solutions)
Nome: Production API Key
Tipo: Live
Stato: Attiva
Data Creazione: 2025-11-15T10:35:00Z
Ultimo Utilizzo: 2025-11-28T17:44:30Z
Permessi: 
  - certify:read
  - certify:write
  - verify:read
  - analytics:read
Rate Limit: 1000 req/min
Chiamate Totali: 3421
Chiamate Oggi: 127
IP Whitelist: 
  - 192.168.1.0/24
  - 203.0.113.0/24
Scadenza: 2026-11-15T10:35:00Z
```

### API Key #002
```
Key ID: key_test_tk_def456uvw012
Cliente: cust_def456uvw (MediaPlatform Inc)
Nome: Development API Key
Tipo: Test
Stato: Attiva
Data Creazione: 2025-11-20T14:25:00Z
Ultimo Utilizzo: 2025-11-28T16:29:15Z
Permessi: 
  - certify:read
  - certify:write
  - verify:read
Rate Limit: 100 req/min
Chiamate Totali: 1890
Chiamate Oggi: 45
IP Whitelist: Nessuna
Scadenza: Mai
Note: Solo per ambiente di sviluppo
```

### API Key #003
```
Key ID: key_live_sk_ghi789rst345
Cliente: cust_ghi789rst (ContentVerify Ltd)
Nome: Main API Key
Tipo: Live
Stato: Revocata
Data Creazione: 2025-10-05T09:20:00Z
Data Revoca: 2025-11-25T12:05:00Z
Ultimo Utilizzo: 2025-11-25T12:00:00Z
Permessi: 
  - certify:read
  - certify:write
  - verify:read
Rate Limit: 100 req/min
Chiamate Totali: 1000
Motivo Revoca: Cliente sospeso per limite raggiunto
```

---

## 3️⃣ USAGE TRACKING (Tracciamento Consumi)

### Tracciamento #001
```
Tracking ID: track_20251128_001
Cliente: cust_abc123xyz (TechCorp Solutions)
API Key: key_live_sk_abc123xyz789
Timestamp: 2025-11-28T17:44:30Z
Endpoint: POST /api/v1/certify
Metodo: certify
Hash Certificato: 0x609f3111c9ffb9c9cfd46e7c1fbafa08b9944646411a90a4d4cf92a5d7e2242b
Transaction Hash: 0x72773792fa8bccf4a4565c5040b7e34c4ed45e89c651cab502981d1c599b6d9a
Tipo Contenuto: image/jpeg
Dimensione File: 245678 bytes
IP Address: 203.0.113.42
User Agent: TechCorp-API-Client/1.2.3
Response Time: 234ms
Status Code: 200
Costo: 0.000000091911 ETH
Gas Price: 0.001 Gwei
```

### Tracciamento #002
```
Tracking ID: track_20251128_002
Cliente: cust_def456uvw (MediaPlatform Inc)
API Key: key_test_tk_def456uvw012
Timestamp: 2025-11-28T16:29:15Z
Endpoint: GET /api/v1/verify/0x...
Metodo: verify
Hash Verificato: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
IP Address: 198.51.100.15
User Agent: MediaPlatform-Verifier/2.1.0
Response Time: 45ms
Status Code: 200
Costo: 0 ETH (read-only)
```

### Tracciamento #003
```
Tracking ID: track_20251128_003
Cliente: cust_abc123xyz (TechCorp Solutions)
API Key: key_live_sk_abc123xyz789
Timestamp: 2025-11-28T17:30:00Z
Endpoint: POST /api/v1/certify
Metodo: certify
Hash Certificato: 0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba
Transaction Hash: 0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
Tipo Contenuto: video/mp4
Dimensione File: 15728640 bytes
IP Address: 203.0.113.42
User Agent: TechCorp-API-Client/1.2.3
Response Time: 3120ms
Status Code: 200
Costo: 0.000000091911 ETH
Gas Price: 0.001 Gwei
Note: File grande, tempo di elaborazione maggiore
```

### Statistiche Giornaliere - 2025-11-28
```
Data: 2025-11-28
Totale Certificazioni: 172
Totale Verifiche: 458
Totale Chiamate API: 630
Clienti Attivi: 2
API Keys Utilizzate: 3
Costo Totale Gas: 0.000015808692 ETH
Revenue: $0.45 (calcolato su base tariffa)
Più Attivo: cust_abc123xyz (127 chiamate)
Endpoint Più Usato: /api/v1/verify (458 chiamate)
```

---

## 4️⃣ BLOCKCHAIN CERTIFICATIONS

### Certificazione #001
```
Certification ID: cert_abc123xyz_001
Cliente: cust_abc123xyz (TechCorp Solutions)
Hash: 0x609f3111c9ffb9c9cfd46e7c1fbafa08b9944646411a90a4d4cf92a5d7e2242b
Transaction Hash: 0x72773792fa8bccf4a4565c5040b7e34c4ed45e89c651cab502981d1c599b6d9a
Block Number: 9725707
Block Hash: 0xBlockHash123...
Timestamp Blockchain: 1764351468 (2025-11-28T17:37:48Z)
Timestamp Sistema: 2025-11-28T17:44:30Z
Creatore: 0x03454f6CdB45B55AFE58a86008B65e085028Bd31
Tipo Contenuto: human (0)
Stato: Confermata
Conferme: 12
Gas Usato: 91911
Gas Price: 0.001 Gwei
Costo: 0.000000091911 ETH
IPFS CID: QmXyZ123... (se applicabile)
Metadata:
  - Tipo File: image/jpeg
  - Dimensione: 245678 bytes
  - Nome File: product_photo_001.jpg
  - Cliente ID: cust_abc123xyz
Etherscan: https://sepolia.etherscan.io/tx/0x72773792fa8bccf4a4565c5040b7e34c4ed45e89c651cab502981d1c599b6d9a
```

### Certificazione #002
```
Certification ID: cert_def456uvw_045
Cliente: cust_def456uvw (MediaPlatform Inc)
Hash: 0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba
Transaction Hash: 0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
Block Number: 9725715
Block Hash: 0xBlockHash456...
Timestamp Blockchain: 1764351520 (2025-11-28T17:38:40Z)
Timestamp Sistema: 2025-11-28T16:29:15Z
Creatore: 0xMediaPlatformWallet456...
Tipo Contenuto: ai (1)
Stato: Confermata
Conferme: 8
Gas Usato: 91911
Gas Price: 0.001 Gwei
Costo: 0.000000091911 ETH
IPFS CID: QmAbC789... (se applicabile)
Metadata:
  - Tipo File: text/plain
  - Dimensione: 1024 bytes
  - Nome File: article_content.txt
  - Cliente ID: cust_def456uvw
Etherscan: https://sepolia.etherscan.io/tx/0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
```

### Statistiche Blockchain
```
Totale Certificazioni: 5311
Certificazioni Oggi: 172
Certificazioni Questa Settimana: 1245
Certificazioni Questo Mese: 5311
Totale Gas Speso: 0.488 ETH
Media Gas per Certificazione: 91911
Blockchain: Sepolia (Testnet)
Contratto: 0x5F7e406d82863a3C86f5255630d26a8Ff863D62D
Ultima Certificazione: 2025-11-28T17:44:30Z
```

---

## 5️⃣ BILLING (Stripe)

### Fattura #001
```
Invoice ID: inv_abc123xyz_202511
Cliente: cust_abc123xyz (TechCorp Solutions)
Periodo: 2025-11-01 - 2025-11-30
Stato: Pagata
Data Emissione: 2025-11-28T00:00:00Z
Data Scadenza: 2025-12-05T00:00:00Z
Data Pagamento: 2025-11-28T10:15:00Z
Piano: Enterprise
Tariffa Base: $299.00/mese
Certificazioni Incluse: 10000
Certificazioni Usate: 3421
Certificazioni Extra: 0
Costo Extra: $0.00
Costo Gas (Stimato): $12.50
Subtotale: $299.00
IVA (22%): $65.78
Totale: $364.78
Metodo Pagamento: card_xxxx4242
Stripe Payment ID: pi_3ABC123xyz789
Stripe Invoice ID: in_1ABC123xyz789
PDF: https://billing.contentcert.com/invoices/inv_abc123xyz_202511.pdf
```

### Fattura #002
```
Invoice ID: inv_def456uvw_202511
Cliente: cust_def456uvw (MediaPlatform Inc)
Periodo: 2025-11-20 - 2025-12-20
Stato: In Attesa
Data Emissione: 2025-11-28T00:00:00Z
Data Scadenza: 2025-12-05T00:00:00Z
Data Pagamento: null
Piano: Professional
Tariffa Base: $99.00/mese
Certificazioni Incluse: 5000
Certificazioni Usate: 1890
Certificazioni Extra: 0
Costo Extra: $0.00
Costo Gas (Stimato): $6.25
Subtotale: $99.00
IVA (22%): $21.78
Totale: $120.78
Metodo Pagamento: card_xxxx5678
Stripe Payment ID: null
Stripe Invoice ID: in_1DEF456uvw012
PDF: https://billing.contentcert.com/invoices/inv_def456uvw_202511.pdf
```

### Abbonamento #001
```
Subscription ID: sub_abc123xyz
Cliente: cust_abc123xyz (TechCorp Solutions)
Stato: Attivo
Piano: Enterprise
Data Inizio: 2025-11-15T10:30:00Z
Data Rinnovo: 2025-12-15T10:30:00Z
Ciclo Fatturazione: Mensile
Prezzo: $299.00
Stripe Subscription ID: sub_1ABC123xyz789
Stripe Customer ID: cus_ABC123xyz789
Metodo Pagamento Predefinito: card_xxxx4242
Cancellato: No
Note: Rinnovo automatico attivo
```

### Transazione Stripe #001
```
Transaction ID: tx_stripe_001
Cliente: cust_abc123xyz (TechCorp Solutions)
Stripe Payment Intent: pi_3ABC123xyz789
Stato: succeeded
Importo: $364.78
Valuta: USD
Data: 2025-11-28T10:15:00Z
Metodo: card_xxxx4242
Descrizione: Invoice inv_abc123xyz_202511
Fee Stripe: $10.94 (2.9% + $0.30)
Net Amount: $353.84
Invoice: inv_abc123xyz_202511
```

---

## 6️⃣ LOGS & SECURITY

### Log Accesso #001
```
Log ID: log_20251128_001
Timestamp: 2025-11-28T17:44:30Z
Cliente: cust_abc123xyz (TechCorp Solutions)
API Key: key_live_sk_abc123xyz789
Tipo: API_REQUEST
Endpoint: POST /api/v1/certify
IP Address: 203.0.113.42
User Agent: TechCorp-API-Client/1.2.3
Status Code: 200
Response Time: 234ms
Request Size: 245678 bytes
Response Size: 512 bytes
Autenticazione: API Key
Autorizzazione: OK
Rate Limit: 127/1000 req/min
```

### Log Sicurezza #001
```
Log ID: sec_20251128_001
Timestamp: 2025-11-28T15:30:00Z
Tipo: FAILED_AUTH
Cliente: Sconosciuto
API Key: key_live_sk_abc123xyz789 (tentativo)
IP Address: 198.51.100.99
User Agent: curl/7.68.0
Endpoint: POST /api/v1/certify
Motivo: API Key non valida o revocata
Azione: Richiesta bloccata
Notifica: Inviata a admin@contentcert.com
Threat Level: Medium
```

### Log Sicurezza #002
```
Log ID: sec_20251128_002
Timestamp: 2025-11-28T14:20:00Z
Tipo: RATE_LIMIT_EXCEEDED
Cliente: cust_def456uvw (MediaPlatform Inc)
API Key: key_test_tk_def456uvw012
IP Address: 198.51.100.15
User Agent: MediaPlatform-Verifier/2.1.0
Endpoint: GET /api/v1/verify
Motivo: Superato limite di 100 req/min
Azione: Richiesta rifiutata (429)
Rate Limit Reset: 2025-11-28T14:21:00Z
Threat Level: Low
```

### Log Sistema #001
```
Log ID: sys_20251128_001
Timestamp: 2025-11-28T00:00:00Z
Tipo: DAILY_REPORT
Evento: Report giornaliero generato
Dettagli:
  - Certificazioni: 172
  - Verifiche: 458
  - Clienti Attivi: 2
  - Revenue: $0.45
  - Errori: 0
  - Uptime: 99.98%
Destinatari: admin@contentcert.com, ops@contentcert.com
```

### Audit Log #001
```
Audit ID: audit_20251128_001
Timestamp: 2025-11-28T10:15:00Z
Utente: admin@contentcert.com
Azione: API_KEY_REVOKED
Oggetto: key_live_sk_ghi789rst345
Cliente: cust_ghi789rst (ContentVerify Ltd)
Motivo: Cliente sospeso per limite raggiunto
IP Address: 203.0.113.1
User Agent: Admin-Panel/1.0.0
Risultato: Successo
```

### Alert Sicurezza #001
```
Alert ID: alert_20251128_001
Timestamp: 2025-11-28T15:30:00Z
Tipo: SUSPICIOUS_ACTIVITY
Severità: Medium
Descrizione: Tentativo di accesso con API key revocata
IP Address: 198.51.100.99
Cliente Coinvolto: cust_abc123xyz
Azione: Bloccato automaticamente
Notifica: Inviata a security@contentcert.com
Status: In Review
```

---

## 📊 Dashboard Statistiche (Esempio)

```
=== CONTENT CERT CHAIN - DASHBOARD ===
Data: 2025-11-28 18:00:00 UTC

CLIENTI
- Totali: 3
- Attivi: 2
- Sospesi: 1
- Nuovi Oggi: 0

API KEYS
- Totali: 3
- Attive: 2
- Revocate: 1
- Utilizzate Oggi: 3

USAGE (Oggi)
- Certificazioni: 172
- Verifiche: 458
- Totale Chiamate: 630
- Errori: 0
- Success Rate: 100%

BLOCKCHAIN
- Certificazioni Totali: 5311
- Certificazioni Oggi: 172
- Gas Speso Oggi: 0.015808692 ETH
- Transazioni Confermate: 172/172 (100%)

BILLING
- Revenue Oggi: $0.45
- Revenue Questo Mese: $364.78
- Fatture Emesse: 2
- Fatture Pagate: 1
- Fatture In Attesa: 1

SICUREZZA
- Tentativi Falliti: 1
- Rate Limits Raggiunti: 1
- Alert Attivi: 1
- Uptime: 99.98%
- Response Time Medio: 156ms
```

---

## 🔗 Relazioni tra Sezioni

```
Cliente (cust_abc123xyz)
  ├── API Keys (key_live_sk_abc123xyz789)
  │     ├── Usage Tracking (track_20251128_001, track_20251128_003, ...)
  │     └── Logs & Security (log_20251128_001, sec_20251128_001, ...)
  ├── Blockchain Certifications (cert_abc123xyz_001, cert_abc123xyz_002, ...)
  └── Billing (inv_abc123xyz_202511, sub_abc123xyz, tx_stripe_001)
```

---

**Nota**: Questo è un esempio di struttura dati per un sistema enterprise completo. Ogni sezione può essere implementata come database separato o come collezioni/tabelle in un database unificato.
