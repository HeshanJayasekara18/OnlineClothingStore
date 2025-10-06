# Azure Deployment Script for ClothStore API
# This script automates the deployment of the ClothStore API to Azure

param(
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroup = "clothstore-rg",
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "eastus",
    
    [Parameter(Mandatory=$false)]
    [string]$AcrName = "clothstoreacr",
    
    [Parameter(Mandatory=$false)]
    [string]$AppName = "clothstore-api",
    
    [Parameter(Mandatory=$false)]
    [string]$AppServicePlan = "clothstore-plan",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("B1", "B2", "S1", "P1V2")]
    [string]$Sku = "B1",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild,
    
    [Parameter(Mandatory=$false)]
    [switch]$UpdateOnly
)

# Color output functions
function Write-Step {
    param([string]$Message)
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if Azure CLI is installed
Write-Step "Checking prerequisites..."
try {
    az --version | Out-Null
    Write-Success "Azure CLI is installed"
} catch {
    Write-Error-Custom "Azure CLI is not installed. Please install it from: https://aka.ms/installazurecliwindows"
    exit 1
}

# Check if logged in to Azure
Write-Step "Checking Azure login status..."
$account = az account show 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in to Azure. Logging in..."
    az login
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Failed to login to Azure"
        exit 1
    }
}
Write-Success "Logged in to Azure"

# Display current subscription
$subscription = az account show --query name -o tsv
Write-Host "Current subscription: $subscription" -ForegroundColor Yellow
$confirm = Read-Host "Continue with this subscription? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "Please set the correct subscription using: az account set --subscription SUBSCRIPTION-ID"
    exit 0
}

if (-not $UpdateOnly) {
    # Create Resource Group
    Write-Step "Creating resource group '$ResourceGroup'..."
    az group create --name $ResourceGroup --location $Location --output none
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Resource group created/verified"
    } else {
        Write-Error-Custom "Failed to create resource group"
        exit 1
    }

    # Create Azure Container Registry
    Write-Step "Creating Azure Container Registry '$AcrName'..."
    $ErrorActionPreference = 'SilentlyContinue'
    $acrExists = az acr show --name $AcrName --resource-group $ResourceGroup 2>&1
    $ErrorActionPreference = 'Continue'
    if ($LASTEXITCODE -ne 0) {
        az acr create --resource-group $ResourceGroup --name $AcrName --sku Basic --admin-enabled true --output none
        if ($LASTEXITCODE -eq 0) {
            Write-Success "ACR created successfully"
        } else {
            Write-Error-Custom "Failed to create ACR"
            exit 1
        }
    } else {
        Write-Success "ACR already exists"
    }
}

# Build and push Docker image
if (-not $SkipBuild) {
    Write-Step "Building and pushing Docker image to ACR..."
    az acr build --registry $AcrName --image clothstoreapi:latest --file Dockerfile . --output none
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Docker image built and pushed successfully"
    } else {
        Write-Error-Custom "Failed to build/push Docker image"
        exit 1
    }
} else {
    Write-Host "Skipping Docker build (SkipBuild flag set)" -ForegroundColor Yellow
}

if (-not $UpdateOnly) {
    # Create App Service Plan
    Write-Step "Creating App Service Plan '$AppServicePlan'..."
    $ErrorActionPreference = 'SilentlyContinue'
    $planExists = az appservice plan show --name $AppServicePlan --resource-group $ResourceGroup 2>&1
    $ErrorActionPreference = 'Continue'
    if ($LASTEXITCODE -ne 0) {
        az appservice plan create `
            --name $AppServicePlan `
            --resource-group $ResourceGroup `
            --is-linux `
            --sku $Sku `
            --output none
        if ($LASTEXITCODE -eq 0) {
            Write-Success "App Service Plan created"
        } else {
            Write-Error-Custom "Failed to create App Service Plan"
            exit 1
        }
    } else {
        Write-Success "App Service Plan already exists"
    }

    # Create Web App
    Write-Step "Creating Web App '$AppName'..."
    $ErrorActionPreference = 'SilentlyContinue'
    $webAppExists = az webapp show --name $AppName --resource-group $ResourceGroup 2>&1
    $ErrorActionPreference = 'Continue'
    if ($LASTEXITCODE -ne 0) {
        az webapp create `
            --resource-group $ResourceGroup `
            --plan $AppServicePlan `
            --name $AppName `
            --deployment-container-image-name "$AcrName.azurecr.io/clothstoreapi:latest" `
            --output none
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Web App created"
        } else {
            Write-Error-Custom "Failed to create Web App"
            exit 1
        }
    } else {
        Write-Success "Web App already exists"
    }

    # Configure ACR credentials
    Write-Step "Configuring ACR credentials..."
    $acrUsername = az acr credential show --name $AcrName --query username -o tsv
    $acrPassword = az acr credential show --name $AcrName --query passwords[0].value -o tsv

    az webapp config container set `
        --name $AppName `
        --resource-group $ResourceGroup `
        --docker-custom-image-name "$AcrName.azurecr.io/clothstoreapi:latest" `
        --docker-registry-server-url "https://$AcrName.azurecr.io" `
        --docker-registry-server-user $acrUsername `
        --docker-registry-server-password $acrPassword `
        --output none
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "ACR credentials configured"
    }

    # Enable continuous deployment
    Write-Step "Enabling continuous deployment..."
    az webapp deployment container config `
        --name $AppName `
        --resource-group $ResourceGroup `
        --enable-cd true `
        --output none
    Write-Success "Continuous deployment enabled"

    # Configure basic settings
    Write-Step "Configuring basic application settings..."
    az webapp config appsettings set `
        --name $AppName `
        --resource-group $ResourceGroup `
        --settings DOTNET_RUNNING_IN_CONTAINER="true" `
        --output none
    Write-Success "Basic settings configured"

    # Enable logging
    Write-Step "Enabling container logging..."
    az webapp log config `
        --name $AppName `
        --resource-group $ResourceGroup `
        --docker-container-logging filesystem `
        --output none
    Write-Success "Logging enabled"
} else {
    Write-Host "Skipping resource creation (UpdateOnly flag set)" -ForegroundColor Yellow
}

# Restart the web app to pull latest image
Write-Step "Restarting Web App..."
az webapp restart --name $AppName --resource-group $ResourceGroup --output none
if ($LASTEXITCODE -eq 0) {
    Write-Success "Web App restarted"
}

# Get the Web App URL
Write-Step "Deployment completed!"
$webAppUrl = az webapp show --name $AppName --resource-group $ResourceGroup --query defaultHostName -o tsv

Write-Host "`n" -NoNewline
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Deployment Summary" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Resource Group: " -NoNewline; Write-Host $ResourceGroup -ForegroundColor Yellow
Write-Host "ACR Name: " -NoNewline; Write-Host $AcrName -ForegroundColor Yellow
Write-Host "App Name: " -NoNewline; Write-Host $AppName -ForegroundColor Yellow
Write-Host "App URL: " -NoNewline; Write-Host "https://$webAppUrl" -ForegroundColor Cyan
Write-Host "`nTest endpoints:" -ForegroundColor Green
Write-Host "  Health: " -NoNewline; Write-Host "https://$webAppUrl/health" -ForegroundColor Cyan
Write-Host "  API: " -NoNewline; Write-Host "https://$webAppUrl/" -ForegroundColor Cyan
Write-Host "  MongoDB Test: " -NoNewline; Write-Host "https://$webAppUrl/test-mongodb" -ForegroundColor Cyan
Write-Host "`nIMPORTANT: Configure environment variables!" -ForegroundColor Yellow
Write-Host "Run the following command to set your secrets:`n" -ForegroundColor Yellow
Write-Host "az webapp config appsettings set --name $AppName --resource-group $ResourceGroup --settings ``" -ForegroundColor Gray
Write-Host "  MongoDbSettings__ConnectionString='your-connection-string' ``" -ForegroundColor Gray
Write-Host "  Authentication__Google__ClientId='your-client-id' ``" -ForegroundColor Gray
Write-Host "  Authentication__Google__ClientSecret='your-client-secret' ``" -ForegroundColor Gray
Write-Host "  OpenAI__Endpoint='your-endpoint' ``" -ForegroundColor Gray
Write-Host "  OpenAI__ApiKey='your-api-key' ``" -ForegroundColor Gray
Write-Host "  Gemini__ApiKey='your-gemini-key'" -ForegroundColor Gray
Write-Host "`nView logs with:" -ForegroundColor Green
Write-Host "  az webapp log tail --name $AppName --resource-group $ResourceGroup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Green
