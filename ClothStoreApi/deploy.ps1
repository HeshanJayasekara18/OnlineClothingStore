# Backend Deployment Script
# Deploys ClothStoreApi to Azure Web App

param(
    [string]$Version = "latest"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Backend Deployment..." -ForegroundColor Cyan
Write-Host ""

# Configuration
$ACR_NAME = "clothstoreacr123"
$IMAGE_NAME = "my-backend"
$RESOURCE_GROUP = "clothstoreGroupCentral"
$WEBAPP_NAME = "clothstoreapiapp"
$FULL_IMAGE_NAME = "$ACR_NAME.azurecr.io/$IMAGE_NAME:$Version"

# Step 1: Build Docker Image
Write-Host "📦 Step 1/4: Building Docker image..." -ForegroundColor Yellow
docker build -t $FULL_IMAGE_NAME .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker image built successfully!" -ForegroundColor Green
Write-Host ""

# Step 2: Login to Azure Container Registry
Write-Host "🔐 Step 2/4: Logging into Azure Container Registry..." -ForegroundColor Yellow
az acr login --name $ACR_NAME

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ACR login failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Logged into ACR successfully!" -ForegroundColor Green
Write-Host ""

# Step 3: Push Image to ACR
Write-Host "⬆️  Step 3/4: Pushing image to Azure Container Registry..." -ForegroundColor Yellow
docker push $FULL_IMAGE_NAME

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker push failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Image pushed successfully!" -ForegroundColor Green
Write-Host ""

# Step 4: Restart Web App
Write-Host "🔄 Step 4/4: Restarting Azure Web App..." -ForegroundColor Yellow
az webapp restart --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Web App restart failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Web App restarted successfully!" -ForegroundColor Green
Write-Host ""

# Wait for app to start
Write-Host "⏳ Waiting for app to start (15 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Test the deployment
Write-Host "🧪 Testing deployment..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://$WEBAPP_NAME.azurewebsites.net/health" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Health check passed!" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Health check failed, but deployment completed. Check logs." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Deployment Summary:" -ForegroundColor Cyan
Write-Host "  Image: $FULL_IMAGE_NAME" -ForegroundColor White
Write-Host "  Web App: https://$WEBAPP_NAME.azurewebsites.net" -ForegroundColor White
Write-Host "  Swagger: https://$WEBAPP_NAME.azurewebsites.net/swagger" -ForegroundColor White
Write-Host ""
Write-Host "📝 View logs:" -ForegroundColor Cyan
Write-Host "  az webapp log tail --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP" -ForegroundColor White
Write-Host ""
