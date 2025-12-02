# 🧪 Guida per Testare l'Applicazione

## 🚀 Avvio del Server

```powershell
cd backend
npm start
```

Il server sarà disponibile su: **http://localhost:8080**

## 🌐 Interfaccia Web

Apri il browser e vai su: **http://localhost:8080**

### Funzionalità Disponibili:

1. **Certifica Contenuto**
   - Carica un file (foto, video, documento, testo)
   - Oppure inserisci un URL del file
   - Seleziona il tipo di contenuto (Umano, AI, Misto)
   - Clicca "Certifica Contenuto"
   - Riceverai l'hash e il transaction hash

2. **Verifica Certificazione**
   - Inserisci l'hash ricevuto dopo la certificazione
   - Clicca "Verifica"
   - Vedrai i dettagli della certificazione sulla blockchain

## 📡 Test con Postman

### 1. Certifica un File

**Endpoint:** `POST http://localhost:8080/certify`

**Body (form-data):**
- `file`: [seleziona un file]
- `creator_wallet`: `0x03454f6CdB45B55AFE58a86008B65e085028Bd31`
- `declared_type`: `human` (o `ai`, `mixed`)

**Oppure con URL:**
- `file_url`: `https://example.com/image.jpg`
- `creator_wallet`: `0x03454f6CdB45B55AFE58a86008B65e085028Bd31`
- `declared_type`: `human`

**Risposta di successo:**
```json
{
  "status": "certified",
  "hash": "0x...",
  "txHash": "0x...",
  "ipfs": "Qm..." // se IPFS è configurato
}
```

### 2. Verifica un Hash

**Endpoint:** `GET http://localhost:8080/verify/:hash`

**Esempio:** `GET http://localhost:8080/verify/0x1234567890abcdef...`

**Risposta se trovato:**
```json
{
  "status": "found",
  "hash": "0x...",
  "creator": "0x...",
  "contentType": 0,
  "declared_type": "human",
  "timestamp": "1234567890"
}
```

**Risposta se non trovato:**
```json
{
  "status": "not_found"
}
```

## 🧪 Esempi di Test

### Test 1: Certifica una Foto
1. Vai su http://localhost:8080
2. Tab "Certifica"
3. Seleziona un'immagine (JPG, PNG, ecc.)
4. Tipo: "Umano"
5. Clicca "Certifica Contenuto"
6. Copia l'hash ricevuto

### Test 2: Verifica l'Hash
1. Tab "Verifica"
2. Incolla l'hash copiato
3. Clicca "Verifica"
4. Dovresti vedere i dettagli della certificazione

### Test 3: Certifica un Testo
1. Crea un file .txt con del testo
2. Caricalo tramite l'interfaccia web
3. Verifica che l'hash sia unico per ogni contenuto

## ⚠️ Note Importanti

- Assicurati che il contratto sia deployato e configurato nel file `.env`
- Il wallet deve avere ETH Sepolia per pagare il gas
- Le transazioni sulla blockchain richiedono qualche secondo per essere confermate
- L'interfaccia web mostra tutti gli errori in modo chiaro

## 🐛 Risoluzione Problemi

### Server non si avvia
- Verifica che la porta 8080 non sia già in uso
- Controlla gli errori nel terminale
- Esegui `npm install` se mancano dipendenze

### Errore "Contratto non configurato"
- Verifica che `CONTRACT_ADDRESS` sia nel file `.env`
- Assicurati di aver fatto il deploy del contratto

### Errore "Insufficient funds"
- Il wallet non ha abbastanza ETH Sepolia
- Ottieni ETH da un faucet (vedi OTTENERE_ETH_SEPOLIA.md)
