# 🔍 Guida alla Diagnostica

## Problema: Le certificazioni non funzionano

Se le certificazioni non vengono registrate sulla blockchain, segui questi passi:

### 1. Verifica lo stato del sistema

Apri nel browser o con Postman:
```
GET http://localhost:8080/diagnostics
```

Questo ti mostrerà:
- Configurazione del contratto
- Stato della connessione blockchain
- Saldo del wallet
- Eventuali errori

### 2. Test diretto della blockchain

Esegui lo script di test:
```powershell
npm run test-cert
```

Questo testa direttamente la blockchain, bypassando l'API.

### 3. Test via API

Esegui lo script di debug:
```powershell
node debug-certify.js
```

Questo simula una richiesta API completa e mostra tutti gli errori.

### 4. Controlla i log del server

Quando provi a certificare, controlla il terminale dove è in esecuzione il server. Dovresti vedere:

```
📋 Certificazione richiesta:
   Hash calcolato: 0x...
   Dimensione file: XXX bytes
🚀 Avvio certificazione sulla blockchain...
🔐 Tentativo di certificazione sulla blockchain:
   Hash: 0x...
   Creatore: 0x...
   Tipo: 0
   Wallet: 0x...
   Saldo wallet: X.XX ETH
📤 Invio transazione...
✅ Transazione inviata: 0x...
⏳ Attesa conferma...
✅ Transazione confermata!
```

### 5. Problemi comuni

#### "Contratto non configurato"
- Verifica che `CONTRACT_ADDRESS` sia nel file `.env`
- Assicurati di aver fatto il deploy del contratto

#### "Wallet senza fondi"
- Ottieni ETH Sepolia da un faucet
- Vedi `OTTENERE_ETH_SEPOLIA.md`

#### "Hash non valido"
- L'hash deve essere esattamente 66 caratteri (0x + 64 hex)
- Questo è automatico, ma se vedi questo errore c'è un bug

#### "Already certified"
- Il contenuto è già stato certificato
- Ogni file può essere certificato solo una volta

#### Transazione inviata ma non confermata
- Attendi qualche secondo
- Le transazioni richiedono tempo per essere confermate
- Controlla su Etherscan: https://sepolia.etherscan.io/

### 6. Verifica su Etherscan

Se ricevi un `txHash`, puoi verificare la transazione su:
```
https://sepolia.etherscan.io/tx/[TX_HASH]
```

### 7. Log dettagliati

Per vedere tutti i log, avvia il server con:
```powershell
npm start
```

E controlla il terminale per tutti i messaggi di debug.

## Cosa fare se ancora non funziona

1. Esegui `npm run test-cert` e condividi l'output completo
2. Esegui `node debug-certify.js` e condividi l'output completo
3. Controlla `GET /diagnostics` e condividi la risposta
4. Condividi i log del server quando provi a certificare
