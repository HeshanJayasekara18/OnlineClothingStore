# Final deployment script with fixed environment variables
Write-Host "=== Azure Container Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Get ACR credentials
Write-Host "1. Getting ACR credentials..." -ForegroundColor Yellow
$ACR_USERNAME = az acr credential show --name clothstoreacr123 --query username -o tsv
$ACR_PASSWORD = az acr credential show --name clothstoreacr123 --query passwords[0].value -o tsv
Write-Host "   ✓ ACR credentials retrieved" -ForegroundColor Green
Write-Host ""

# Create container with environment variables from JSON file
Write-Host "2. Creating container with environment variables..." -ForegroundColor Yellow
az container create `
  --resource-group myNewResourceGroup2 `
  --name my-backend-container `
  --image clothstoreacr123.azurecr.io/my-backend:latest `
  --cpu 1 --memory 1.5 `
  --ports 8080 `
  --dns-name-label my-backend-app2 `
  --os-type Linux `
  --registry-login-server clothstoreacr123.azurecr.io `
  --registry-username $ACR_USERNAME `
  --registry-password $ACR_PASSWORD `
  --restart-policy Always `
  --environment-variables "@container-env.json"

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ Container creation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "   ✓ Container created successfully" -ForegroundColor Green
Write-Host ""

# Wait for container to start
Write-Host "3. Waiting 20 seconds for container to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Check status
Write-Host "4. Checking container status..." -ForegroundColor Yellow
$restartCount = az container show --resource-group myNewResourceGroup2 --name my-backend-container --query "containers[0].instanceView.restartCount" -o tsv
$state = az container show --resource-group myNewResourceGroup2 --name my-backend-container --query "instanceView.state" -o tsv

Write-Host ""
Write-Host "=== Container Status ===" -ForegroundColor Cyan
Write-Host "State: $state" -ForegroundColor $(if ($state -eq "Running") { "Green" } else { "Yellow" })
Write-Host "Restart Count: $restartCount" -ForegroundColor $(if ($restartCount -eq "0") { "Green" } else { "Red" })
Write-Host ""

# Get container details
$FQDN = az container show --resource-group myNewResourceGroup2 --name my-backend-container --query "ipAddress.fqdn" -o tsv
$IP = az container show --resource-group myNewResourceGroup2 --name my-backend-container --query "ipAddress.ip" -o tsv

Write-Host "FQDN: $FQDN" -ForegroundColor White
Write-Host "IP: $IP" -ForegroundColor White
Write-Host "URL: http://${FQDN}:8080" -ForegroundColor Cyan
Write-Host ""

# Show logs
Write-Host "5. Container logs:" -ForegroundColor Yellow
Write-Host "---" -ForegroundColor Gray
az container logs --resource-group myNewResourceGroup2 --name my-backend-container
Write-Host "---" -ForegroundColor Gray
Write-Host ""

# Test health endpoint
Write-Host "6. Testing health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://${FQDN}:8080/health" -TimeoutSec 10 -UseBasicParsing
    Write-Host "   ✓ Health check passed: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "   ⚠ Health check failed: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   Container may still be starting up. Wait a few more seconds and try:" -ForegroundColor Gray
    Write-Host "   curl http://${FQDN}:8080/health" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== Deployment Complete ===" -ForegroundColor Green
Write-Host "API Endpoints:" -ForegroundColor Cyan
Write-Host "  Health: http://${FQDN}:8080/health" -ForegroundColor White
Write-Host "  Test: http://${FQDN}:8080/test" -ForegroundColor White
Write-Host "  Root: http://${FQDN}:8080/" -ForegroundColor White
Write-Host ""
Write-Host "Monitor logs: az container logs --resource-group myNewResourceGroup2 --name my-backend-container --follow" -ForegroundColor Gray
