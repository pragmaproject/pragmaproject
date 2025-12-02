# 🔧 Configurazione Semplice - Guida Passo Passo

## Il Problema
Il file `.env` non ha l'API key di Alchemy configurata correttamente. Senza questa chiave, non puoi connetterti alla blockchain.

## Soluzione - 3 Passi Semplici

### PASSO 1: Ottieni l'API Key di Alchemy

1. **Vai su questo sito**: https://dashboard.alchemy.com/
2. **Crea un account** (se non ce l'hai già):
   - Clicca su "Sign Up" o "Create Account"
   - Usa la tua email
3. **Crea una nuova App**:
   - Dopo il login, clicca su "Create App" o "Create New App"
   - Nome: puoi chiamarla "ContentCert" (o qualsiasi nome)
   - Chain: seleziona **"Ethereum"**
   - Network: seleziona **"Sepolia"** (rete di test)
   - Clicca "Create App"
4. **Copia l'API Key**:
   - Nella pagina della tua app, vedrai una sezione "API Key"
   - Clicca su "View Key" o "Show Key"
   - **COPIA** la chiave (è una stringa lunga tipo: `abc123def456...`)

### PASSO 2: Apri il file .env

1. Vai nella cartella `backend` del progetto
2. Apri il file chiamato `.env` con un editor di testo (Notepad, VS Code, ecc.)
3. Dovresti vedere qualcosa tipo:
   ```
   ALCHEMY_API_KEY=your_alchemy_api_key_here
   PRIVATE_KEY=0x60b44d33...
   CONTRACT_ADDRESS=
   ```

### PASSO 3: Sostituisci l'API Key

1. Trova la riga che dice `ALCHEMY_API_KEY=your_alchemy_api_key_here`
2. **Sostituisci** `your_alchemy_api_key_here` con la chiave che hai copiato da Alchemy
3. Dovrebbe diventare tipo:
   ```
   ALCHEMY_API_KEY=abc123def456ghi789... (la tua chiave reale)
   ```
4. **Salva** il file

### PASSO 4: Verifica che funzioni

Apri il terminale nella cartella `backend` e scrivi:
```powershell
npm run check-env
```

Se vedi tutti ✅ (spunte verdi), sei pronto!

### PASSO 5: Fai il Deploy

Ora puoi eseguire:
```powershell
npm run deploy
```

---

## ⚠️ Note Importanti

- **PRIVATE_KEY**: Se inizia con `0x`, rimuovilo. Hardhat vuole la chiave senza `0x`
- **ALCHEMY_API_KEY**: Deve essere la chiave COMPLETA che hai copiato da Alchemy
- Non condividere MAI il file `.env` con altri!

## 🆘 Ancora Problemi?

Se dopo aver fatto tutto questo vedi ancora errori:
1. Verifica di aver salvato il file `.env`
2. Controlla che non ci siano spazi extra nella chiave
3. Esegui di nuovo `npm run check-env` per vedere cosa manca
