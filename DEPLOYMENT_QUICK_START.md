# 🚀 Deployment Quick Start Guide

## 📋 Prerequisites

Before deploying, make sure you have:
- ✅ Docker Desktop installed and running
- ✅ Azure CLI installed (`az --version`)
- ✅ Logged into Azure (`az login`)
- ✅ Access to Azure resources

---

## ⚡ Quick Deploy (One Command)

### Windows PowerShell:
```powershell
cd "d:\Projects\Cothing Store\ClothStoreApi"
.\deploy.ps1
```

### Manual (4 Commands):
```bash
# 1. Build
docker build -t clothstoreacr123.azurecr.io/my-backend:latest .

# 2. Login
az acr login --name clothstoreacr123

# 3. Push
docker push clothstoreacr123.azurecr.io/my-backend:latest

# 4. Restart
az webapp restart --name clothstoreapiapp --resource-group clothstoreGroupCentral
```

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT (Your PC)                         │
│                                                                  │
│  📁 ClothStoreApi/                                              │
│  ├── Controllers/                                               │
│  ├── Models/                                                    │
│  ├── Services/                                                  │
│  ├── Program.cs                                                 │
│  └── Dockerfile  ←──────────────────────┐                      │
│                                          │                       │
└──────────────────────────────────────────┼───────────────────────┘
                                          │
                                          │ docker build
                                          ↓
                              ┌─────────────────────┐
                              │   Docker Image      │
                              │   (Containerized)   │
                              └─────────────────────┘
                                          │
                                          │ docker push
                                          ↓
┌─────────────────────────────────────────────────────────────────┐
│                  AZURE CONTAINER REGISTRY                        │
│                                                                  │
│  📦 clothstoreacr123.azurecr.io                                 │
│     └── my-backend:latest                                       │
│                                                                  │
│  - Stores Docker images                                         │
│  - Version control                                              │
│  - Private & secure                                             │
└──────────────────────────────────────────┬──────────────────────┘
                                          │
                                          │ pull & run
                                          ↓
┌─────────────────────────────────────────────────────────────────┐
│                    AZURE WEB APP                                 │
│                                                                  │
│  🌐 clothstoreapiapp.azurewebsites.net                          │
│                                                                  │
│  ┌───────────────────────────────────────────────────────┐     │
│  │  🐳 Running Container                                 │     │
│  │                                                        │     │
│  │  - ASP.NET Core 9.0                                   │     │
│  │  - Port 8080                                          │     │
│  │  - Auto-restart on crash                              │     │
│  │  - HTTPS enabled                                      │     │
│  │  - Environment variables injected                     │     │
│  └───────────────────────────────────────────────────────┘     │
│                                                                  │
│  Environment:                                                    │
│  • MongoDbSettings__ConnectionString                            │
│  • Authentication__Google__ClientId                             │
│  • Gemini__ApiKey                                               │
└──────────────────────────────────────────┬──────────────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    ↓                     ↓                     ↓
            ┌──────────────┐      ┌──────────────┐    ┌──────────────┐
            │   MongoDB    │      │   Google     │    │   Gemini     │
            │   Atlas      │      │   OAuth      │    │   API        │
            │  (Database)  │      │   (Auth)     │    │   (AI)       │
            └──────────────┘      └──────────────┘    └──────────────┘
```

---

## 🔄 Deployment Flow

```
1. CODE CHANGE
   ↓
2. BUILD DOCKER IMAGE
   docker build -t clothstoreacr123.azurecr.io/my-backend:latest .
   ↓
3. PUSH TO REGISTRY
   docker push clothstoreacr123.azurecr.io/my-backend:latest
   ↓
4. RESTART WEB APP
   az webapp restart --name clothstoreapiapp --resource-group clothstoreGroupCentral
   ↓
5. WEB APP PULLS NEW IMAGE
   ↓
6. CONTAINER STARTS
   ↓
7. APP IS LIVE ✅
```

---

## 📊 What Happens During Deployment?

### Step 1: Build (Local)
```
Your Code → Dockerfile → Docker Image
```
- Compiles .NET code
- Creates optimized image
- Includes all dependencies
- ~200MB final size

### Step 2: Push (Upload)
```
Docker Image → Azure Container Registry
```
- Uploads layers (incremental)
- Stores securely
- Tags with version

### Step 3: Deploy (Azure)
```
ACR → Web App → Running Container
```
- Web App pulls image
- Stops old container
- Starts new container
- Routes traffic

---

## 🎯 Key Concepts

### Docker Image
- **What:** Packaged version of your app
- **Contains:** Code + Runtime + Dependencies
- **Size:** ~200MB
- **Portable:** Runs anywhere

### Container Registry (ACR)
- **What:** Storage for Docker images
- **Like:** GitHub for Docker images
- **Private:** Only you can access
- **Fast:** Within Azure network

### Web App (App Service)
- **What:** Managed hosting service
- **Runs:** Your Docker container
- **Provides:** HTTPS, scaling, monitoring
- **Manages:** Infrastructure for you

---

## 🔐 Security

### How Secrets Are Stored:
```
❌ NOT in code
❌ NOT in Docker image
❌ NOT in Git

✅ In Azure Web App Environment Variables
✅ Encrypted at rest
✅ Injected at runtime
```

### Access Control:
```
Docker Image → ACR (Private)
              ↓
         Azure Web App (Authenticated)
              ↓
         Your App (Secure)
```

---

## 📈 Scaling

### Current Setup:
- **1 instance** (Basic tier)
- **1.75 GB RAM**
- **1 vCPU**
- **10 GB storage**

### To Scale Up:
```bash
# Vertical scaling (more power)
az appservice plan update --name clothstorePlan --resource-group clothstoreGroupCentral --sku S1

# Horizontal scaling (more instances)
az webapp scale --name clothstoreapiapp --resource-group clothstoreGroupCentral --instance-count 3
```

---

## 🔍 Monitoring

### View Logs:
```bash
# Real-time
az webapp log tail --name clothstoreapiapp --resource-group clothstoreGroupCentral

# Download
az webapp log download --name clothstoreapiapp --resource-group clothstoreGroupCentral
```

### Check Health:
```bash
# Via curl
curl https://clothstoreapiapp.azurewebsites.net/health

# Via browser
https://clothstoreapiapp.azurewebsites.net/health
```

### Azure Portal:
1. Go to: https://portal.azure.com
2. Search: `clothstoreapiapp`
3. View: Metrics, Logs, Alerts

---

## 🛠️ Common Tasks

### Update Environment Variable:
```bash
az webapp config appsettings set \
  --name clothstoreapiapp \
  --resource-group clothstoreGroupCentral \
  --settings "KEY=VALUE"
```

### View All Settings:
```bash
az webapp config appsettings list \
  --name clothstoreapiapp \
  --resource-group clothstoreGroupCentral
```

### Force Pull Latest Image:
```bash
az webapp config container set \
  --name clothstoreapiapp \
  --resource-group clothstoreGroupCentral \
  --docker-custom-image-name clothstoreacr123.azurecr.io/my-backend:latest
```

---

## 🚨 Troubleshooting

### Deployment fails?
```bash
# Check Docker is running
docker ps

# Check Azure login
az account show

# Check ACR access
az acr login --name clothstoreacr123
```

### App not starting?
```bash
# View logs
az webapp log tail --name clothstoreapiapp --resource-group clothstoreGroupCentral

# Check container status
az webapp show --name clothstoreapiapp --resource-group clothstoreGroupCentral --query "state"
```

### 404 errors?
```bash
# Check if app is running
curl https://clothstoreapiapp.azurewebsites.net/health

# Restart app
az webapp restart --name clothstoreapiapp --resource-group clothstoreGroupCentral
```

---

## 📚 Resources

### Your Resources:
- **Web App:** https://clothstoreapiapp.azurewebsites.net
- **Swagger:** https://clothstoreapiapp.azurewebsites.net/swagger
- **Azure Portal:** https://portal.azure.com
- **ACR:** clothstoreacr123.azurecr.io

### Documentation:
- **Azure Web Apps:** https://docs.microsoft.com/azure/app-service/
- **Docker:** https://docs.docker.com/
- **ASP.NET Core:** https://docs.microsoft.com/aspnet/core/

---

## ✅ Deployment Checklist

Before deploying:
- [ ] Code changes committed
- [ ] Tests passing
- [ ] Docker Desktop running
- [ ] Azure CLI logged in
- [ ] Environment variables set in Azure

After deploying:
- [ ] Health check passes
- [ ] Swagger UI accessible
- [ ] API endpoints working
- [ ] Logs show no errors
- [ ] Frontend can connect

---

## 🎉 You're Ready!

Your backend deployment is:
- ✅ **Automated** with script
- ✅ **Secure** with private registry
- ✅ **Scalable** with Azure
- ✅ **Monitored** with logs
- ✅ **Production-ready**

**Deploy now:**
```powershell
cd "d:\Projects\Cothing Store\ClothStoreApi"
.\deploy.ps1
```

Happy deploying! 🚀
