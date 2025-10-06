# Deploy container with MongoDB connection string
$MONGODB_CONN = "mongodb+srv://jayasekaravithanageheshan_db_user:HM81764014jv@shoesstore.kud20ib.mongodb.net/?retryWrites=true&w=majority"

Write-Host "Getting ACR credentials..." -ForegroundColor Yellow
$ACR_USERNAME = az acr credential show --name clothstoreacr123 --query username -o tsv
$ACR_PASSWORD = az acr credential show --name clothstoreacr123 --query passwords[0].value -o tsv

Write-Host "Creating container with environment variables..." -ForegroundColor Green

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
  --environment-variables `
    DOTNET_RUNNING_IN_CONTAINER=true `
    ASPNETCORE_ENVIRONMENT=Production `
    MongoDbSettings__ConnectionString=$MONGODB_CONN `
    MongoDbSettings__DatabaseName=ClothStoreDb

Write-Host ""
Write-Host "Waiting 15 seconds for container to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "Checking container status..." -ForegroundColor Cyan
$restartCount = az container show --resource-group myNewResourceGroup2 --name my-backend-container --query "containers[0].instanceView.restartCount" -o tsv
Write-Host "Restart Count: $restartCount" -ForegroundColor $(if ($restartCount -eq "0") { "Green" } else { "Red" })

Write-Host ""
Write-Host "Container logs:" -ForegroundColor Cyan
az container logs --resource-group myNewResourceGroup2 --name my-backend-container

Write-Host ""
$FQDN = az container show --resource-group myNewResourceGroup2 --name my-backend-container --query "ipAddress.fqdn" -o tsv
Write-Host "API URL: http://${FQDN}:8080" -ForegroundColor Green
Write-Host "Testing health endpoint..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://${FQDN}:8080/health" -UseBasicParsing -TimeoutSec 10
    Write-Host "Health check: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}
