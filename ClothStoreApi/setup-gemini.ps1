# Setup Gemini API Key in Azure
# Run this script after getting your API key from https://aistudio.google.com/app/apikey

param(
    [Parameter(Mandatory=$true)]
    [string]$GeminiApiKey
)

Write-Host "🔧 Configuring Gemini API Key in Azure..." -ForegroundColor Cyan

# Set the environment variable in Azure Web App
az webapp config appsettings set `
  --name clothstoreapiapp `
  --resource-group clothstoreGroupCentral `
  --settings "Gemini__ApiKey=$GeminiApiKey"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Gemini API Key configured successfully!" -ForegroundColor Green
    
    Write-Host "`n🔄 Restarting Web App..." -ForegroundColor Cyan
    az webapp restart --name clothstoreapiapp --resource-group clothstoreGroupCentral
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Web App restarted successfully!" -ForegroundColor Green
        Write-Host "`n🎉 Setup Complete!" -ForegroundColor Green
        Write-Host "`nTest your API at:" -ForegroundColor Yellow
        Write-Host "https://clothstoreapiapp.azurewebsites.net/api/stylist/suggest" -ForegroundColor Cyan
        Write-Host "`nFrontend URL:" -ForegroundColor Yellow
        Write-Host "https://online-clothing-store-umber.vercel.app/assitant" -ForegroundColor Cyan
    }
} else {
    Write-Host "❌ Failed to configure API key" -ForegroundColor Red
}
