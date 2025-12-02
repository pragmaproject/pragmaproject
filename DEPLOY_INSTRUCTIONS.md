# Istruzioni per il Deploy del Contratto

## ⚠️ IMPORTANTE: Eseguire i comandi dalla directory `backend`

Tutti i comandi Hardhat devono essere eseguiti dalla directory `backend`, non dalla root del progetto.

## Setup Iniziale

1. **Installa le dipendenze** (se non l'hai già fatto):
   ```bash
   cd backend
   npm install
   ```

2. **Crea il file `.env`** nella directory `backend` con le seguenti variabili:
   
   **IMPORTANTE**: Il file `.env` deve essere creato manualmente nella directory `backend`.
   
   Crea un nuovo file chiamato `.env` (senza estensione) e aggiungi:
   ```
   ALCHEMY_API_KEY=your_alchemy_api_key_here
   PRIVATE_KEY=your_private_key_here
   CONTRACT_ADDRESS=
   ```
   
   **Come ottenere le chiavi:**
   - **ALCHEMY_API_KEY**: 
     1. Vai su https://dashboard.alchemy.com/
     2. Crea un account o accedi
     3. Crea una nuova app selezionando "Ethereum" e "Sepolia" come rete
     4. Copia la "API Key" dalla dashboard
   
   - **PRIVATE_KEY**: 
     1. Usa un wallet come MetaMask
     2. Esporta la chiave privata (IMPORTANTE: usa un wallet di test con fondi Sepolia)
     3. Rimuovi il prefisso "0x" se presente
     4. Assicurati che il wallet abbia ETH Sepolia per pagare il gas

3. **Compila il contratto**:
   ```bash
   cd backend
   npx hardhat compile
   ```

## Deploy del Contratto

Per fare il deploy del contratto sulla rete Sepolia:

```bash
cd backend
npm run deploy
```

Oppure direttamente:

```bash
cd backend
npx hardhat run scripts/deploy.cjs --network sepolia
```

## Dopo il Deploy

Dopo il deploy, copia l'indirizzo del contratto stampato nel terminale e aggiungilo al file `.env`:

```
CONTRACT_ADDRESS=0x... (l'indirizzo che hai ricevuto)
```

## Risoluzione Problemi

### Errore "No Hardhat config file found"
- Assicurati di essere nella directory `backend`
- Verifica che il file `hardhat.config.cjs` esista in `backend/`
- Esegui `npm install` per installare tutte le dipendenze

### Errore "Must be authenticated!" o "Invalid JSON-RPC response"
- Verifica che il file `.env` esista nella directory `backend`
- Controlla che `ALCHEMY_API_KEY` sia valida e corretta
- Assicurati che non ci siano spazi extra o caratteri speciali nelle variabili

### Errore durante il deploy
- Verifica che il wallet abbia abbastanza ETH Sepolia per pagare il gas
- Controlla che `PRIVATE_KEY` sia corretta (senza "0x" all'inizio)
- Assicurati di essere connesso a internet
