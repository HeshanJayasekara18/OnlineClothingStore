# Azure Container Instance Deployment with Environment Variables
# Replace the placeholder values below with your actual credentials

# ACR Credentials (already set in your environment)
# $ACR_USERNAME and $ACR_PASSWORD should already be set

# MongoDB Connection String - REPLACE THIS
$MONGODB_CONNECTION_STRING = "mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority"

# Google OAuth (Optional - leave empty if not using)
$GOOGLE_CLIENT_ID = ""
$GOOGLE_CLIENT_SECRET = ""

# Delete existing container
Write-Host "Deleting existing container..." -ForegroundColor Yellow
az container delete --resource-group myNewResourceGroup2 --name my-backend-container --yes

# Create new container with environment variables
Write-Host "Creating new container with environment variables..." -ForegroundColor Green

$envVars = @(
    "DOTNET_RUNNING_IN_CONTAINER=true"
    "ASPNETCORE_ENVIRONMENT=Production"
    "MongoDbSettings__ConnectionString=$MONGODB_CONNECTION_STRING"
    "MongoDbSettings__DatabaseName=ClothStoreDb"
)

# Add Google OAuth if configured
if ($GOOGLE_CLIENT_ID -and $GOOGLE_CLIENT_SECRET) {
    $envVars += "Authentication__Google__ClientId=$GOOGLE_CLIENT_ID"
    $envVars += "Authentication__Google__ClientSecret=$GOOGLE_CLIENT_SECRET"
}

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

Write-Host "`nContainer created! Waiting 10 seconds before checking logs..." -ForegroundColor Green
Start-Sleep -Seconds 10

Write-Host "`nChecking container logs..." -ForegroundColor Cyan
az container logs --resource-group myNewResourceGroup2 --name my-backend-container

Write-Host "`nContainer details:" -ForegroundColor Cyan
az container show --resource-group myNewResourceGroup2 --name my-backend-container --query "{FQDN:ipAddress.fqdn,IP:ipAddress.ip,State:instanceView.state,RestartCount:containers[0].instanceView.restartCount}" -o table
