# Docker Start Script
Write-Host "Starting LoL Backend Docker..." -ForegroundColor Green

# Change to script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Check docker-compose.yml
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "ERROR: docker-compose.yml not found" -ForegroundColor Red
    exit 1
}

# Change to project root for building
Set-Location ..

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
docker-compose -f docker/docker-compose.yml down

# Build image
Write-Host "Building Docker image..." -ForegroundColor Yellow
docker build -f Dockerfile.oracle -t paqas/lol-backend:ver1.3 .

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Docker build failed" -ForegroundColor Red
    exit 1
}

# Start containers
Write-Host "Starting containers..." -ForegroundColor Yellow
docker-compose -f docker/docker-compose.yml up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to start containers" -ForegroundColor Red
    exit 1
}

Write-Host "Docker container started successfully!" -ForegroundColor Green
Write-Host "Useful commands:" -ForegroundColor Cyan
Write-Host "  View logs: docker-compose -f docker/docker-compose.yml logs -f" -ForegroundColor White
Write-Host "  Stop: docker-compose -f docker/docker-compose.yml down" -ForegroundColor White
Write-Host "  Restart: docker-compose -f docker/docker-compose.yml restart" -ForegroundColor White
Write-Host "Application: http://localhost:8080" -ForegroundColor Cyan

# Show recent logs
Start-Sleep -Seconds 2
Write-Host "Recent logs:" -ForegroundColor Yellow
docker-compose -f docker/docker-compose.yml logs --tail=20
