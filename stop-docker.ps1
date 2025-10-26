# Docker Stop Script
Write-Host "Stopping LoL Backend Docker..." -ForegroundColor Yellow

# Check docker-compose.yml
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "ERROR: docker-compose.yml not found" -ForegroundColor Red
    exit 1
}

# Stop and remove containers
Write-Host "Stopping containers..." -ForegroundColor Yellow
docker-compose down

Write-Host "Docker container stopped successfully." -ForegroundColor Green

# Optional: Remove image
$choice = Read-Host "Do you want to remove the Docker image as well? (y/n)"
if ($choice -eq "y") {
    docker rmi lol-backend:latest
    Write-Host "Docker image removed." -ForegroundColor Green
}
