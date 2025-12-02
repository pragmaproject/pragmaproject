#!/bin/bash

# Script di aiuto per il deploy del contratto
# Assicurati di essere nella directory backend prima di eseguire

echo "🔍 Verificando configurazione..."

# Verifica se siamo nella directory corretta
if [ ! -f "hardhat.config.cjs" ]; then
    echo "❌ ERRORE: File hardhat.config.cjs non trovato!"
    echo "⚠️  Assicurati di essere nella directory 'backend'"
    echo "   Esegui: cd backend"
    exit 1
fi

# Verifica se esiste .env
if [ ! -f ".env" ]; then
    echo "⚠️  File .env non trovato!"
    echo "   Crea un file .env con ALCHEMY_API_KEY e PRIVATE_KEY"
    exit 1
fi

# Verifica se le dipendenze sono installate
if [ ! -d "node_modules" ]; then
    echo "📦 Installando dipendenze..."
    npm install
fi

# Compila il contratto
echo "🔨 Compilando il contratto..."
npx hardhat compile

if [ $? -ne 0 ]; then
    echo "❌ Errore durante la compilazione!"
    exit 1
fi

# Deploy
echo "🚀 Eseguendo il deploy sulla rete Sepolia..."
npm run deploy

echo "✅ Deploy completato! Copia l'indirizzo del contratto nel file .env come CONTRACT_ADDRESS"
