# 🏗️ Backend Deployment Architecture

## 📊 Current Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR DEVELOPMENT MACHINE                  │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  ClothStoreApi (ASP.NET Core)                      │    │
│  │  - Controllers, Models, Services                    │    │
│  │  - Dockerfile                                       │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↓                                   │
│                    docker build                              │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Docker Image                                       │    │
│  │  clothstoreacr123.azurecr.io/my-backend:latest     │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────────────────┬───────────────────────────┘
                                   │ docker push
                                   ↓
┌─────────────────────────────────────────────────────────────┐
│              AZURE CONTAINER REGISTRY (ACR)                  │
│                                                              │
│  Registry: clothstoreacr123.azurecr.io                      │
│  Image: my-backend:latest                                   │
│  - Stores Docker images                                     │
│  - Private registry                                         │
└──────────────────────────────────┬───────────────────────────┘
                                   │ pull image
                                   ↓
┌─────────────────────────────────────────────────────────────┐
│              AZURE WEB APP (App Service)                     │
│                                                              │
│  Name: clothstoreapiapp                                     │
│  Resource Group: clothstoreGroupCentral                     │
│  Region: Central US                                         │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Running Container                                  │    │
│  │  - ASP.NET Core App                                │    │
│  │  - Port 8080                                       │    │
│  │  - Environment Variables                           │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Environment Variables:                                     │
│  - MongoDbSettings__ConnectionString                        │
│  - MongoDbSettings__DatabaseName                            │
│  - Authentication__Google__ClientId                         │
│  - Authentication__Google__ClientSecret                     │
│  - Gemini__ApiKey                                           │
│                                                              │
│  URL: https://clothstoreapiapp.azurewebsites.net           │
└──────────────────────────────────┬───────────────────────────┘
                                   │
                                   ↓
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   MongoDB    │  │  Google      │  │   Gemini     │     │
│  │   Atlas      │  │  OAuth       │  │   API        │     │
│  │  (Database)  │  │  (Auth)      │  │  (AI)        │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Deployment Process (Step by Step)

### Current Manual Deployment Process:

```bash
# 1. Build Docker Image
docker build -t clothstoreacr123.azurecr.io/my-backend:latest .

# 2. Login to Azure Container Registry
az acr login --name clothstoreacr123

# 3. Push Image to ACR
docker push clothstoreacr123.azurecr.io/my-backend:latest

# 4. Restart Web App (pulls latest image)
az webapp restart --name clothstoreapiapp --resource-group clothstoreGroupCentral
```

---

## 📦 Components Explained

### 1. **Dockerfile**
**Location:** `ClothStoreApi/Dockerfile`

```dockerfile
# Multi-stage build
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base  # Runtime
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build    # Build tools

# Build and publish
RUN dotnet publish -c Release -o /app/publish

# Final image
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ClothStoreApi.dll"]
```

**Purpose:** Defines how to build your app into a Docker container

---

### 2. **Azure Container Registry (ACR)**
**Name:** `clothstoreacr123`

**What it does:**
- Stores your Docker images
- Private registry (secure)
- Integrated with Azure Web App

**Why we use it:**
- Azure Web App can pull images directly
- Version control for images
- Fast deployment within Azure

---

### 3. **Azure Web App (App Service)**
**Name:** `clothstoreapiapp`

**What it does:**
- Runs your Docker container
- Provides HTTPS endpoint
- Auto-scaling
- Health monitoring
- Log streaming

**Configuration:**
- **Container:** Pulls from ACR
- **Port:** 8080 (configured in Dockerfile)
- **Environment:** Production
- **Restart Policy:** Always

---

## 🔐 Environment Variables

Stored in Azure Web App settings (not in code):

```bash
# MongoDB
MongoDbSettings__ConnectionString=mongodb+srv://...
MongoDbSettings__DatabaseName=ClothStoreDb

# Google OAuth
Authentication__Google__ClientId=...
Authentication__Google__ClientSecret=...

# Docker Registry
DOCKER_REGISTRY_SERVER_URL=https://clothstoreacr123.azurecr.io
DOCKER_REGISTRY_SERVER_USERNAME=clothstoreacr123
DOCKER_REGISTRY_SERVER_PASSWORD=...

# Gemini AI
Gemini__ApiKey=AIzaSyD81QOu4FKCu-TBV05XxK0L5pOzBgecfzk
```

---

## 🚀 Deployment Methods

### Method 1: Manual Deployment (Current)
```bash
# From ClothStoreApi directory
docker build -t clothstoreacr123.azurecr.io/my-backend:latest .
az acr login --name clothstoreacr123
docker push clothstoreacr123.azurecr.io/my-backend:latest
az webapp restart --name clothstoreapiapp --resource-group clothstoreGroupCentral
```

**Pros:** Simple, full control  
**Cons:** Manual, no automation

---

### Method 2: GitHub Actions (Automated)
**Location:** `.github/workflows/deploy-backend.yml`

```yaml
name: Deploy Backend to Azure

on:
  push:
    branches: [ main ]
    paths:
      - 'ClothStoreApi/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Login to ACR
        run: az acr login --name clothstoreacr123
      
      - name: Build and Push
        run: |
          docker build -t clothstoreacr123.azurecr.io/my-backend:latest .
          docker push clothstoreacr123.azurecr.io/my-backend:latest
      
      - name: Restart Web App
        run: az webapp restart --name clothstoreapiapp --resource-group clothstoreGroupCentral
```

**Pros:** Automatic on git push, CI/CD  
**Cons:** Requires GitHub secrets setup

---

### Method 3: Azure CLI Script
**Create:** `deploy.ps1` or `deploy.sh`

```powershell
# deploy.ps1
Write-Host "Building Docker image..." -ForegroundColor Cyan
docker build -t clothstoreacr123.azurecr.io/my-backend:latest .

Write-Host "Logging into ACR..." -ForegroundColor Cyan
az acr login --name clothstoreacr123

Write-Host "Pushing to ACR..." -ForegroundColor Cyan
docker push clothstoreacr123.azurecr.io/my-backend:latest

Write-Host "Restarting Web App..." -ForegroundColor Cyan
az webapp restart --name clothstoreapiapp --resource-group clothstoreGroupCentral

Write-Host "Deployment complete!" -ForegroundColor Green
```

**Pros:** One command deployment  
**Cons:** Still manual trigger

---

## 🔍 How to Monitor

### View Logs:
```bash
# Real-time logs
az webapp log tail --name clothstoreapiapp --resource-group clothstoreGroupCentral

# Download logs
az webapp log download --name clothstoreapiapp --resource-group clothstoreGroupCentral
```

### Check App Status:
```bash
# Get app info
az webapp show --name clothstoreapiapp --resource-group clothstoreGroupCentral

# Check if running
curl https://clothstoreapiapp.azurewebsites.net/health
```

### Azure Portal:
1. Go to: https://portal.azure.com
2. Find: `clothstoreapiapp`
3. View: Metrics, Logs, Deployment Center

---

## 🏗️ Infrastructure as Code (Optional)

### Using Azure CLI:
```bash
# Create Resource Group
az group create --name clothstoreGroupCentral --location centralus

# Create Container Registry
az acr create --name clothstoreacr123 --resource-group clothstoreGroupCentral --sku Basic

# Create App Service Plan
az appservice plan create --name clothstorePlan --resource-group clothstoreGroupCentral --is-linux

# Create Web App
az webapp create --name clothstoreapiapp --resource-group clothstoreGroupCentral --plan clothstorePlan --deployment-container-image-name clothstoreacr123.azurecr.io/my-backend:latest
```

---

## 📊 Cost Breakdown

### Current Setup:
- **Azure Container Registry (Basic):** ~$5/month
- **App Service (Basic B1):** ~$13/month
- **MongoDB Atlas (Free Tier):** $0
- **Gemini API (Free Tier):** $0
- **Total:** ~$18/month

### To Scale Up:
- **App Service (Standard S1):** ~$70/month (better performance)
- **MongoDB Atlas (Shared M2):** ~$9/month (more storage)
- **Gemini API (Paid):** Pay per use

---

## 🔄 Continuous Deployment Setup

### Option 1: GitHub Actions (Recommended)

1. **Add GitHub Secrets:**
   ```
   AZURE_CREDENTIALS
   ACR_LOGIN_SERVER
   ACR_USERNAME
   ACR_PASSWORD
   ```

2. **Create Workflow:** `.github/workflows/deploy-backend.yml`

3. **Push to main branch** → Auto-deploy!

### Option 2: Azure DevOps

1. Create Azure DevOps project
2. Connect to your repo
3. Create build pipeline
4. Create release pipeline
5. Auto-deploy on commit

---

## 🛠️ Troubleshooting

### Image not updating?
```bash
# Force pull latest image
az webapp config container set --name clothstoreapiapp --resource-group clothstoreGroupCentral --docker-custom-image-name clothstoreacr123.azurecr.io/my-backend:latest

# Restart
az webapp restart --name clothstoreapiapp --resource-group clothstoreGroupCentral
```

### Can't push to ACR?
```bash
# Re-login
az acr login --name clothstoreacr123

# Check credentials
az acr credential show --name clothstoreacr123
```

### App not starting?
```bash
# Check logs
az webapp log tail --name clothstoreapiapp --resource-group clothstoreGroupCentral

# Check environment variables
az webapp config appsettings list --name clothstoreapiapp --resource-group clothstoreGroupCentral
```

---

## 📚 Best Practices

### 1. **Use Tags for Versions**
```bash
# Instead of :latest, use version tags
docker build -t clothstoreacr123.azurecr.io/my-backend:v1.0.0 .
docker build -t clothstoreacr123.azurecr.io/my-backend:latest .
```

### 2. **Automated Testing**
```bash
# Add to CI/CD pipeline
dotnet test
docker build ...
```

### 3. **Health Checks**
```csharp
// Already in your app
app.MapGet("/health", () => "Healthy");
```

### 4. **Monitoring**
- Enable Application Insights
- Set up alerts
- Monitor performance

### 5. **Backup Strategy**
- Regular MongoDB backups
- Keep old Docker images
- Document environment variables

---

## 🎯 Quick Reference

### Deploy Backend:
```bash
cd "d:\Projects\Cothing Store\ClothStoreApi"
docker build -t clothstoreacr123.azurecr.io/my-backend:latest .
az acr login --name clothstoreacr123
docker push clothstoreacr123.azurecr.io/my-backend:latest
az webapp restart --name clothstoreapiapp --resource-group clothstoreGroupCentral
```

### View Logs:
```bash
az webapp log tail --name clothstoreapiapp --resource-group clothstoreGroupCentral
```

### Update Environment Variable:
```bash
az webapp config appsettings set --name clothstoreapiapp --resource-group clothstoreGroupCentral --settings "KEY=VALUE"
```

---

## 🚀 Next Steps

1. **Set up GitHub Actions** for automated deployment
2. **Enable Application Insights** for monitoring
3. **Add staging environment** for testing
4. **Implement blue-green deployment** for zero downtime
5. **Set up automated backups** for MongoDB

---

**Your backend is production-ready!** 🎉
