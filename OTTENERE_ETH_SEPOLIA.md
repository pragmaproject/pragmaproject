# 💰 Come Ottenere ETH Sepolia Gratuiti

## Il Problema
Il tuo wallet non ha abbastanza ETH Sepolia (ETH di test) per pagare il gas del deploy del contratto.

## Soluzione: Usa un Faucet Sepolia

Un "faucet" è un servizio che ti dà ETH di test gratuiti per sviluppare sulla rete Sepolia.

### Opzione 1: Alchemy Faucet (Consigliato) ⭐

1. **Vai su**: https://sepoliafaucet.com/
2. **Collega il tuo wallet** (MetaMask o altro)
3. **Incolla l'indirizzo del tuo wallet** (quello associato alla PRIVATE_KEY nel file .env)
4. **Clicca "Send Me ETH"**
5. **Attendi qualche minuto** - riceverai 0.5 ETH Sepolia

### Opzione 2: Infura Faucet

1. **Vai su**: https://www.infura.io/faucet/sepolia
2. **Accedi con GitHub** o crea un account
3. **Incolla l'indirizzo del tuo wallet**
4. **Richiedi ETH**

### Opzione 3: Chainlink Faucet

1. **Vai su**: https://faucets.chain.link/sepolia
2. **Collega il tuo wallet**
3. **Richiedi ETH e LINK** (riceverai entrambi)

## Come Trovare l'Indirizzo del Tuo Wallet

L'indirizzo del wallet è quello associato alla `PRIVATE_KEY` nel file `.env`.

Puoi trovarlo in diversi modi:

### Metodo 1: Da MetaMask
1. Apri MetaMask
2. Seleziona il wallet che corrisponde alla tua PRIVATE_KEY
3. Copia l'indirizzo (inizia con `0x...`)

### Metodo 2: Usa uno script Node.js
Ho creato uno script che ti mostra l'indirizzo. Esegui:
```powershell
node get-wallet-address.js
```

## Dopo Aver Ricevuto ETH

1. **Attendi 1-2 minuti** che la transazione venga confermata
2. **Verifica il saldo** su https://sepolia.etherscan.io/ (cerca il tuo indirizzo)
3. **Riprova il deploy**:
   ```powershell
   npm run deploy
   ```

## Quanto ETH Serve?

Per il deploy di un contratto semplice come ContentCert, bastano **0.01 ETH Sepolia** (circa). I faucet di solito danno 0.5 ETH, che è più che sufficiente.

## ⚠️ Importante

- Gli ETH Sepolia sono **solo per test** - non hanno valore reale
- Non puoi convertirli in ETH reali
- Ogni faucet ha limiti (es. una richiesta al giorno)
