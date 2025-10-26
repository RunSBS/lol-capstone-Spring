# Docker Start Script
Write-Host "Starting LoL Backend Docker..." -ForegroundColor Green

# Check docker-compose.yml
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "ERROR: docker-compose.yml not found" -ForegroundColor Red
    exit 1
}

# Check Oracle Wallet
$walletPath = "C:/Users/Hyun/Downloads/Wallet_RUF8A028O85QYAUX"
if (-not (Test-Path $walletPath)) {
    Write-Host "WARNING: Oracle Wallet not found: $walletPath" -ForegroundColor Yellow
    Write-Host "Please ensure Oracle Wallet is in the correct path." -ForegroundColor Yellow
    exit 1
}

Write-Host "Oracle Wallet found" -ForegroundColor Green

# Clean up existing containers
Write-Host "Cleaning up existing containers..." -ForegroundColor Yellow
docker-compose down

# Build image
Write-Host "Building Docker image..." -ForegroundColor Yellow
docker build -f Dockerfile.oracle -t lol-backend:latest .

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker build failed" -ForegroundColor Red
    exit 1
}

# Start containers
Write-Host "Starting containers..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to start containers" -ForegroundColor Red
    exit 1
}

Write-Host "Docker container started successfully!" -ForegroundColor Green
Write-Host "Useful commands:" -ForegroundColor Cyan
Write-Host "  View logs: docker-compose logs -f" -ForegroundColor White
Write-Host "  Stop: docker-compose down" -ForegroundColor White
Write-Host "  Restart: docker-compose restart" -ForegroundColor White
Write-Host "Application: http://localhost:8080" -ForegroundColor Cyan

# Show recent logs
Start-Sleep -Seconds 2
Write-Host "Recent logs:" -ForegroundColor Yellow
docker-compose logs --tail=20
