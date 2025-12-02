@echo off
REM Script di aiuto per il deploy del contratto (Windows)
REM Assicurati di essere nella directory backend prima di eseguire

echo 🔍 Verificando configurazione...

REM Verifica se siamo nella directory corretta
if not exist "hardhat.config.cjs" (
    echo ❌ ERRORE: File hardhat.config.cjs non trovato!
    echo ⚠️  Assicurati di essere nella directory 'backend'
    echo    Esegui: cd backend
    exit /b 1
)

REM Verifica se esiste .env
if not exist ".env" (
    echo ⚠️  File .env non trovato!
    echo    Crea un file .env con ALCHEMY_API_KEY e PRIVATE_KEY
    exit /b 1
)

REM Verifica se le dipendenze sono installate
if not exist "node_modules" (
    echo 📦 Installando dipendenze...
    call npm install
)

REM Compila il contratto
echo 🔨 Compilando il contratto...
call npx hardhat compile

if errorlevel 1 (
    echo ❌ Errore durante la compilazione!
    exit /b 1
)

REM Deploy
echo 🚀 Eseguendo il deploy sulla rete Sepolia...
call npm run deploy

echo ✅ Deploy completato! Copia l'indirizzo del contratto nel file .env come CONTRACT_ADDRESS
