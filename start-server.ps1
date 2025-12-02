# Script per avviare il server
Write-Host "Avvio del server..."
Write-Host ""

# Verifica se la porta è già in uso
$port = 8080
$connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($connections) {
    Write-Host "⚠️  La porta $port è già in uso."
    Write-Host "Esegui '.\stop-server.ps1' per fermare il server esistente"
    exit 1
}

# Avvia il server
npm start
