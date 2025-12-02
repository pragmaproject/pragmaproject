# Script per fermare il server Node.js sulla porta 8080
$port = 8080
$connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($connections) {
    $processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $processIds) {
        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($process -and $process.ProcessName -eq "node") {
            Write-Host "Terminando processo Node.js (PID: $pid)..."
            Stop-Process -Id $pid -Force
            Write-Host "✅ Server fermato"
        }
    }
} else {
    Write-Host "Nessun server in esecuzione sulla porta $port"
}
