# PowerShell setup script for Frontend
# Run this after Node.js is installed

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Power Grid Visualizer - Frontend Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    $npmVersion = npm --version 2>&1
    Write-Host "[OK] Node.js: $nodeVersion" -ForegroundColor Green
    Write-Host "[OK] npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js not found!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "After installing, restart your terminal and run this script again." -ForegroundColor Yellow
    exit 1
}

# Check if we're in the right directory
$currentDir = Get-Location
if ($currentDir.Name -ne "frontend") {
    Write-Host "[WARNING] Not in frontend directory. Changing..." -ForegroundColor Yellow
    if (Test-Path "frontend") {
        Set-Location "frontend"
        Write-Host "[OK] Changed to frontend directory" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] frontend folder not found!" -ForegroundColor Red
        Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
        exit 1
    }
}

# Install dependencies
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Create .env file if it doesn't exist
Write-Host ""
Write-Host "Checking .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "[OK] .env file exists" -ForegroundColor Green
} else {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    $envContent = @"
VITE_MAPBOX_TOKEN=your_mapbox_token_here
VITE_API_URL=http://localhost:8000
"@
    $envContent | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "[OK] .env file created" -ForegroundColor Green
    Write-Host "[IMPORTANT] Please edit .env file and add your Mapbox token!" -ForegroundColor Yellow
    Write-Host "Get your token from: https://account.mapbox.com/access-tokens/" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env file with your Mapbox token" -ForegroundColor White
Write-Host "2. Make sure backend is running (uvicorn main:app --reload)" -ForegroundColor White
Write-Host "3. Start frontend: npm run dev" -ForegroundColor White
Write-Host "4. Open browser: http://localhost:5173" -ForegroundColor White
Write-Host ""
