# Quick diagnostic script for map issues

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Map Loading Diagnostic" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check .env file
Write-Host "1. Checking .env file..." -ForegroundColor Yellow
$envPath = ".env"
if (Test-Path $envPath) {
    Write-Host "[OK] .env file exists" -ForegroundColor Green
    $envContent = Get-Content $envPath
    $hasToken = $envContent | Select-String "VITE_MAPBOX_TOKEN"
    if ($hasToken) {
        Write-Host "[OK] VITE_MAPBOX_TOKEN found in .env" -ForegroundColor Green
        $tokenLine = $envContent | Where-Object { $_ -match "VITE_MAPBOX_TOKEN" }
        $tokenValue = ($tokenLine -split "=")[1]
        if ($tokenValue -and $tokenValue -ne "your_mapbox_token_here") {
            Write-Host "[OK] Token appears to be set: $($tokenValue.Substring(0, [Math]::Min(20, $tokenValue.Length)))..." -ForegroundColor Green
        } else {
            Write-Host "[WARNING] Token is placeholder. Please set your actual Mapbox token!" -ForegroundColor Yellow
        }
    } else {
        Write-Host "[ERROR] VITE_MAPBOX_TOKEN not found in .env!" -ForegroundColor Red
    }
} else {
    Write-Host "[ERROR] .env file not found!" -ForegroundColor Red
    Write-Host "Create it with:" -ForegroundColor Yellow
    Write-Host "  VITE_MAPBOX_TOKEN=your_token_here" -ForegroundColor White
    Write-Host "  VITE_API_URL=http://localhost:8000" -ForegroundColor White
}

Write-Host ""

# Check backend
Write-Host "2. Checking backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/health" -UseBasicParsing -TimeoutSec 3
    if ($response.StatusCode -eq 200) {
        Write-Host "[OK] Backend is running" -ForegroundColor Green
        $health = $response.Content | ConvertFrom-Json
        if ($health.neo4j_connected) {
            Write-Host "[OK] Neo4j connected" -ForegroundColor Green
        } else {
            Write-Host "[WARNING] Neo4j not connected" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "[ERROR] Backend not running!" -ForegroundColor Red
    Write-Host "Start it with: cd backend && uvicorn main:app --reload" -ForegroundColor Yellow
}

Write-Host ""

# Check if server is running
Write-Host "3. Checking frontend server..." -ForegroundColor Yellow
Write-Host "[INFO] Make sure 'npm run dev' is running" -ForegroundColor Cyan
Write-Host "[INFO] After changing .env, restart the server!" -ForegroundColor Yellow

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "1. Open browser and press F12 (DevTools)" -ForegroundColor White
Write-Host "2. Check Console tab for errors" -ForegroundColor White
Write-Host "3. Verify token loads: import.meta.env.VITE_MAPBOX_TOKEN" -ForegroundColor White
Write-Host "4. Check Network tab for Mapbox requests" -ForegroundColor White
Write-Host ""
