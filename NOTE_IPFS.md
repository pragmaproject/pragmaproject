# 📝 Nota su IPFS

## IPFS è Opzionale

L'applicazione funziona **senza IPFS**. La certificazione sulla blockchain avviene comunque, anche se IPFS non è configurato.

## Cosa fa IPFS?

IPFS (InterPlanetary File System) è un sistema di storage distribuito che permette di:
- Salvare una copia del file su una rete distribuita
- Ottenere un CID (Content Identifier) che punta al file
- Accedere al file anche se il server originale non è disponibile

## Configurare IPFS (Opzionale)

Se vuoi usare IPFS, aggiungi queste variabili al file `.env`:

```env
USE_IPFS=true
IPFS_PROJECT_ID=your_infura_project_id
IPFS_PROJECT_SECRET=your_infura_project_secret
```

### Come ottenere le credenziali IPFS:

1. Vai su https://infura.io/
2. Crea un account o accedi
3. Crea un nuovo progetto
4. Seleziona "IPFS" come servizio
5. Copia Project ID e Project Secret

## Comportamento Attuale

- ✅ **Senza IPFS**: La certificazione funziona normalmente
- ✅ **Con IPFS configurato**: Il file viene anche caricato su IPFS e ricevi il CID
- ✅ **Se IPFS fallisce**: La certificazione continua comunque sulla blockchain

## Errore "project id required"

Se vedi questo errore, significa che:
- `USE_IPFS=true` è impostato nel `.env`
- Ma `IPFS_PROJECT_ID` e `IPFS_PROJECT_SECRET` non sono configurati

**Soluzione**: Rimuovi `USE_IPFS=true` dal file `.env` oppure aggiungi le credenziali IPFS.
