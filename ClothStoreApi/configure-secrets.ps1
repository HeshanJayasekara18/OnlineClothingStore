# Configure Azure App Service Environment Variables
# This script helps you set up all required environment variables for your API

param(
    [Parameter(Mandatory=$false)]
    [string]$AppName = "clothstore-api",
    
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroup = "clothstore-rg"
)

Write-Host "`n🔐 Configure Azure App Service Secrets" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# Prompt for secrets
Write-Host "Please enter your configuration values:" -ForegroundColor Yellow
Write-Host "(Press Enter to skip any optional values)`n" -ForegroundColor Gray

$mongoConnection = Read-Host "MongoDB Connection String (required)"
if ([string]::IsNullOrWhiteSpace($mongoConnection)) {
    Write-Host "❌ MongoDB connection string is required!" -ForegroundColor Red
    exit 1
}

$googleClientId = Read-Host "Google OAuth Client ID (optional)"
$googleClientSecret = Read-Host "Google OAuth Client Secret (optional)"
$openAiEndpoint = Read-Host "OpenAI Endpoint (optional)"
$openAiKey = Read-Host "OpenAI API Key (optional)"
$geminiKey = Read-Host "Gemini API Key (optional)"

# Build settings array
$settings = @(
    "DOTNET_RUNNING_IN_CONTAINER=true",
    "MongoDbSettings__ConnectionString=$mongoConnection",
    "MongoDbSettings__DatabaseName=ClothStoreDb",
    "MongoDbSettings__CustomersCollection=Customers",
    "MongoDbSettings__ProductsCollection=Products",
    "MongoDbSettings__OrdersCollection=Orders"
)

if (-not [string]::IsNullOrWhiteSpace($googleClientId)) {
    $settings += "Authentication__Google__ClientId=$googleClientId"
}

if (-not [string]::IsNullOrWhiteSpace($googleClientSecret)) {
    $settings += "Authentication__Google__ClientSecret=$googleClientSecret"
}

if (-not [string]::IsNullOrWhiteSpace($openAiEndpoint)) {
    $settings += "OpenAI__Endpoint=$openAiEndpoint"
}

if (-not [string]::IsNullOrWhiteSpace($openAiKey)) {
    $settings += "OpenAI__ApiKey=$openAiKey"
}

if (-not [string]::IsNullOrWhiteSpace($geminiKey)) {
    $settings += "Gemini__ApiKey=$geminiKey"
}

# Apply settings
Write-Host "`n⚙️  Applying configuration to Azure..." -ForegroundColor Yellow

az webapp config appsettings set `
    --name $AppName `
    --resource-group $ResourceGroup `
    --settings $settings `
    --output none

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Configuration applied successfully!`n" -ForegroundColor Green
    
    # Restart the app
    Write-Host "🔄 Restarting Web App to apply changes..." -ForegroundColor Yellow
    az webapp restart --name $AppName --resource-group $ResourceGroup --output none
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Web App restarted`n" -ForegroundColor Green
        
        $webAppUrl = az webapp show --name $AppName --resource-group $ResourceGroup --query defaultHostName -o tsv
        Write-Host "🌐 Your API is ready at: https://$webAppUrl" -ForegroundColor Cyan
        Write-Host "🏥 Test MongoDB connection: https://$webAppUrl/test-mongodb`n" -ForegroundColor Cyan
    }
} else {
    Write-Host "❌ Failed to apply configuration" -ForegroundColor Red
    exit 1
}

Write-Host "💡 Tip: View current settings with:" -ForegroundColor Yellow
Write-Host "   az webapp config appsettings list --name $AppName --resource-group $ResourceGroup`n" -ForegroundColor Gray
