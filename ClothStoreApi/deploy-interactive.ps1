# Interactive Azure Container Instance Deployment
# This script will prompt you for required credentials

Write-Host "=== Azure Container Instance Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Get ACR credentials
Write-Host "Getting ACR credentials..." -ForegroundColor Yellow
$ACR_USERNAME = az acr credential show --name clothstoreacr123 --query username -o tsv
$ACR_PASSWORD = az acr credential show --name clothstoreacr123 --query passwords[0].value -o tsv

if (-not $ACR_USERNAME -or -not $ACR_PASSWORD) {
    Write-Host "ERROR: Could not retrieve ACR credentials!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ ACR credentials retrieved" -ForegroundColor Green
Write-Host ""

# Prompt for MongoDB connection string
Write-Host "Enter your MongoDB connection string:" -ForegroundColor Yellow
Write-Host "Format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority" -ForegroundColor Gray
$MONGODB_CONN = Read-Host "MongoDB Connection String"

if ([string]::IsNullOrWhiteSpace($MONGODB_CONN)) {
    Write-Host "ERROR: MongoDB connection string is required!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Optional: Google OAuth
Write-Host "Google OAuth (Optional - press Enter to skip):" -ForegroundColor Yellow
$GOOGLE_CLIENT_ID = Read-Host "Google Client ID (optional)"
$GOOGLE_CLIENT_SECRET = Read-Host "Google Client Secret (optional)"

Write-Host ""
Write-Host "=== Deployment Configuration ===" -ForegroundColor Cyan
Write-Host "Resource Group: myNewResourceGroup2" -ForegroundColor White
Write-Host "Container Name: my-backend-container" -ForegroundColor White
Write-Host "Image: clothstoreacr123.azurecr.io/my-backend:latest" -ForegroundColor White
Write-Host "MongoDB: [CONFIGURED]" -ForegroundColor Green
if ($GOOGLE_CLIENT_ID) {
    Write-Host "Google OAuth: [CONFIGURED]" -ForegroundColor Green
} else {
    Write-Host "Google OAuth: [SKIPPED]" -ForegroundColor Gray
}
Write-Host ""

# Confirm deployment
$confirm = Read-Host "Proceed with deployment? (Y/N)"
if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "=== Starting Deployment ===" -ForegroundColor Cyan

# Delete existing container
Write-Host "1. Deleting existing container..." -ForegroundColor Yellow
az container delete --resource-group myNewResourceGroup2 --name my-backend-container --yes 2>$null
Write-Host "✓ Old container deleted" -ForegroundColor Green

# Build environment variables array
$envVars = @(
    "DOTNET_RUNNING_IN_CONTAINER=true"
    "ASPNETCORE_ENVIRONMENT=Production"
    "MongoDbSettings__ConnectionString=$MONGODB_CONN"
    "MongoDbSettings__DatabaseName=ClothStoreDb"
)

if ($GOOGLE_CLIENT_ID -and $GOOGLE_CLIENT_SECRET) {
    $envVars += "Authentication__Google__ClientId=$GOOGLE_CLIENT_ID"
    $envVars += "Authentication__Google__ClientSecret=$GOOGLE_CLIENT_SECRET"
}

# Create new container
Write-Host "2. Creating new container with environment variables..." -ForegroundColor Yellow
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
  --environment-variables $envVars

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Container creation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Container created successfully" -ForegroundColor Green
Write-Host ""

# Wait for container to start
Write-Host "3. Waiting 15 seconds for container to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Check container status
Write-Host "4. Checking container status..." -ForegroundColor Yellow
$restartCount = az container show --resource-group myNewResourceGroup2 --name my-backend-container --query "containers[0].instanceView.restartCount" -o tsv

Write-Host ""
Write-Host "=== Deployment Status ===" -ForegroundColor Cyan
Write-Host "Restart Count: $restartCount" -ForegroundColor $(if ($restartCount -eq "0") { "Green" } else { "Red" })

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
    Write-Host "✓ Health check passed: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "⚠ Health check failed (container may still be starting): $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Deployment Complete ===" -ForegroundColor Green
Write-Host "API URL: http://${FQDN}:8080" -ForegroundColor Cyan
Write-Host "Health: http://${FQDN}:8080/health" -ForegroundColor Cyan
Write-Host "Test: http://${FQDN}:8080/test" -ForegroundColor Cyan
Write-Host ""
Write-Host "To view logs: az container logs --resource-group myNewResourceGroup2 --name my-backend-container --follow" -ForegroundColor Gray
