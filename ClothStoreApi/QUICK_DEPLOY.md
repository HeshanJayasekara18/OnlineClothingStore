# Quick Deployment Guide - Azure Container Instances

## Current Status
- ✅ Azure CLI installed and logged in
- ✅ Resource group: `myNewResourceGroup2` (location: eastus2)
- ✅ Container Registry: `clothstoreacr123.azurecr.io`
- ✅ Docker image built and pushed
- ⚠️ **ISSUE**: Container crashing with exit code 134 (CrashLoopBackOff)
- 🔧 **ROOT CAUSE**: Missing MongoDB connection string environment variable

## 🚨 FIX THE CRASH - IMMEDIATE ACTION REQUIRED

### Problem
Your container is crashing because `Program.cs` line 58-59 throws an exception when MongoDB ConnectionString is empty:
```csharp
if (string.IsNullOrEmpty(settings.ConnectionString))
    throw new InvalidOperationException("MongoDB ConnectionString is not configured");
```

### Solution: Deploy with Environment Variables

**Option 1: Use the automated script (RECOMMENDED)**

1. Edit `deploy-with-env.ps1` and add your MongoDB connection string
2. Run the script:
```powershell
.\deploy-with-env.ps1
```

**Option 2: Manual deployment with environment variables**

```powershell
# Set your MongoDB connection string (REPLACE THIS!)
$MONGODB_CONN = "mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority"

# Optional: Google OAuth credentials
$GOOGLE_CLIENT_ID = "your-client-id"
$GOOGLE_CLIENT_SECRET = "your-client-secret"

# Delete the crashing container
az container delete --resource-group myNewResourceGroup2 --name my-backend-container --yes

# Create new container WITH environment variables
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
    MongoDbSettings__DatabaseName=ClothStoreDb `
    Authentication__Google__ClientId=$GOOGLE_CLIENT_ID `
    Authentication__Google__ClientSecret=$GOOGLE_CLIENT_SECRET
```

### Verify the Fix

```powershell
# Wait 15 seconds for container to start
Start-Sleep -Seconds 15

# Check container status (should show 0 restarts)
az container show --resource-group myNewResourceGroup2 --name my-backend-container --query "containers[0].instanceView.restartCount"

# View logs (should show "Application starting in Docker/Azure...")
az container logs --resource-group myNewResourceGroup2 --name my-backend-container

# Test the API
$FQDN = az container show --resource-group myNewResourceGroup2 --name my-backend-container --query "ipAddress.fqdn" -o tsv
curl http://${FQDN}:8080/health
```

### Expected Output
If successful, you should see:
- ✅ Container state: Running
- ✅ Restart count: 0
- ✅ Logs showing: "Application starting in Docker/Azure..."
- ✅ Health endpoint returns: "Healthy"

---

## 📋 Complete Deployment Reference

### Prerequisites
```powershell
# Ensure ACR credentials are set
$ACR_USERNAME = az acr credential show --name clothstoreacr123 --query username -o tsv
$ACR_PASSWORD = az acr credential show --name clothstoreacr123 --query passwords[0].value -o tsv
```

### Build and Push New Image
```powershell
# Build in Azure (no local Docker needed)
az acr build --registry clothstoreacr123 --image my-backend:latest --file Dockerfile .
```

### Update Running Container
```powershell
# Delete old container
az container delete --resource-group myNewResourceGroup2 --name my-backend-container --yes

# Recreate with latest image (use the full command from above with env vars)
```

### Monitor Container
```powershell
# View real-time logs
az container logs --resource-group myNewResourceGroup2 --name my-backend-container --follow

# Check container details
az container show --resource-group myNewResourceGroup2 --name my-backend-container --query "{FQDN:ipAddress.fqdn,IP:ipAddress.ip,State:instanceView.state,Restarts:containers[0].instanceView.restartCount}" -o table

# View recent events
az container show --resource-group myNewResourceGroup2 --name my-backend-container --query "containers[0].instanceView.events[]"
```

### Troubleshooting

**Container keeps restarting?**
- Check environment variables are set correctly
- Verify MongoDB connection string is valid
- Check logs for specific error messages

**Can't connect to MongoDB?**
- Ensure MongoDB Atlas allows connections from Azure IP addresses
- Add `0.0.0.0/0` to MongoDB Atlas Network Access (for testing)
- Verify connection string format

**Port issues?**
- Container exposes port 8080
- Access via: `http://<FQDN>:8080`
- Example: `http://my-backend-app2.eastus2.azurecontainer.io:8080/health`

### Useful Commands
```powershell
# Get container URL
az container show --resource-group myNewResourceGroup2 --name my-backend-container --query "ipAddress.fqdn" -o tsv

# Restart container (keeps env vars)
az container restart --resource-group myNewResourceGroup2 --name my-backend-container

# Delete container
az container delete --resource-group myNewResourceGroup2 --name my-backend-container --yes

# List all containers in resource group
az container list --resource-group myNewResourceGroup2 -o table
```
