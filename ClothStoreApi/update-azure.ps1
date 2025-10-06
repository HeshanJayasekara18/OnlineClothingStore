# Quick Update Script for Azure Deployment
# Use this script to quickly rebuild and deploy updates to your existing Azure deployment

param(
    [Parameter(Mandatory=$false)]
    [string]$AcrName = "clothstoreacr",
    
    [Parameter(Mandatory=$false)]
    [string]$AppName = "clothstore-api",
    
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroup = "clothstore-rg"
)

Write-Host "`n🚀 Quick Update to Azure" -ForegroundColor Cyan
Write-Host "========================`n" -ForegroundColor Cyan

# Build and push to ACR
Write-Host "📦 Building and pushing Docker image..." -ForegroundColor Yellow
az acr build --registry $AcrName --image clothstoreapi:latest --file Dockerfile .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build/push image" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Image pushed successfully`n" -ForegroundColor Green

# Restart web app
Write-Host "🔄 Restarting Web App..." -ForegroundColor Yellow
az webapp restart --name $AppName --resource-group $ResourceGroup

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Web App restarted`n" -ForegroundColor Green
    
    $webAppUrl = az webapp show --name $AppName --resource-group $ResourceGroup --query defaultHostName -o tsv
    Write-Host "🌐 Your API is available at: https://$webAppUrl" -ForegroundColor Cyan
    Write-Host "🏥 Health check: https://$webAppUrl/health`n" -ForegroundColor Cyan
    
    Write-Host "📋 View logs with:" -ForegroundColor Yellow
    Write-Host "   az webapp log tail --name $AppName --resource-group $ResourceGroup`n" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to restart Web App" -ForegroundColor Red
    exit 1
}
