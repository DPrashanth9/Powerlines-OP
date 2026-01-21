# PowerShell setup script for Windows
# Run this script to set up the backend environment

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Power Grid Visualizer - Backend Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
Write-Host "🔍 Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found! Please install Python 3.10+ from python.org" -ForegroundColor Red
    exit 1
}

# Check if virtual environment exists
Write-Host ""
Write-Host "🔍 Checking virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "✅ Virtual environment found" -ForegroundColor Green
} else {
    Write-Host "📦 Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host ""
Write-Host "🔧 Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Upgrade pip
Write-Host ""
Write-Host "📦 Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

# Create .env file if it doesn't exist
Write-Host ""
Write-Host "🔍 Checking .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env file exists" -ForegroundColor Green
} else {
    Write-Host "📝 Creating .env file from env.example..." -ForegroundColor Yellow
    if (Test-Path "env.example") {
        Copy-Item "env.example" ".env"
        Write-Host "✅ .env file created" -ForegroundColor Green
        Write-Host "⚠️  Please edit .env file with your Neo4j credentials!" -ForegroundColor Yellow
    } else {
        Write-Host "❌ env.example not found!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Install Neo4j (see NEO4J_SETUP_GUIDE.md)" -ForegroundColor White
Write-Host "2. Edit .env file with your Neo4j credentials" -ForegroundColor White
Write-Host "3. Run: python test_connection.py" -ForegroundColor White
Write-Host "4. Start server: uvicorn main:app --reload" -ForegroundColor White
Write-Host ""
