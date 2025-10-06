# Deploy Your Container NOW - Copy & Paste Commands

## Step 1: Set Your MongoDB Connection String

**IMPORTANT**: Replace the placeholder with your actual MongoDB connection string!

```powershell
$MONGODB_CONN = "mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/?retryWrites=true&w=majority"
```

## Step 2: Get ACR Credentials

```powershell
$ACR_USERNAME = az acr credential show --name clothstoreacr123 --query username -o tsv
$ACR_PASSWORD = az acr credential show --name clothstoreacr123 --query passwords[0].value -o tsv
```

## Step 3: Delete Old Container

```powershell
az container delete --resource-group myNewResourceGroup2 --name my-backend-container --yes
```

## Step 4: Create New Container with Environment Variables

```powershell
az container create --resource-group myNewResourceGroup2 --name my-backend-container --image clothstoreacr123.azurecr.io/my-backend:latest --cpu 1 --memory 1.5 --ports 8080 --dns-name-label my-backend-app2 --os-type Linux --registry-login-server clothstoreacr123.azurecr.io --registry-username $ACR_USERNAME --registry-password $ACR_PASSWORD --restart-policy Always --environment-variables DOTNET_RUNNING_IN_CONTAINER=true ASPNETCORE_ENVIRONMENT=Production MongoDbSettings__ConnectionString=$MONGODB_CONN MongoDbSettings__DatabaseName=ClothStoreDb
```

## Step 5: Wait and Check Status

```powershell
# Wait 15 seconds
Start-Sleep -Seconds 15

# Check restart count (should be 0)
az container show --resource-group myNewResourceGroup2 --name my-backend-container --query "containers[0].instanceView.restartCount"

# View logs
az container logs --resource-group myNewResourceGroup2 --name my-backend-container

# Get URL
$FQDN = az container show --resource-group myNewResourceGroup2 --name my-backend-container --query "ipAddress.fqdn" -o tsv
Write-Host "API URL: http://${FQDN}:8080"

# Test health endpoint
curl "http://${FQDN}:8080/health"
```

---

## Quick Copy-Paste (All in One)

**Replace YOUR_USERNAME, YOUR_PASSWORD, and YOUR_CLUSTER first!**

```powershell
# Set MongoDB connection string
$MONGODB_CONN = "mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/?retryWrites=true&w=majority"

# Get ACR credentials
$ACR_USERNAME = az acr credential show --name clothstoreacr123 --query username -o tsv
$ACR_PASSWORD = az acr credential show --name clothstoreacr123 --query passwords[0].value -o tsv

# Delete old container
az container delete --resource-group myNewResourceGroup2 --name my-backend-container --yes

# Create new container
az container create --resource-group myNewResourceGroup2 --name my-backend-container --image clothstoreacr123.azurecr.io/my-backend:latest --cpu 1 --memory 1.5 --ports 8080 --dns-name-label my-backend-app2 --os-type Linux --registry-login-server clothstoreacr123.azurecr.io --registry-username $ACR_USERNAME --registry-password $ACR_PASSWORD --restart-policy Always --environment-variables DOTNET_RUNNING_IN_CONTAINER=true ASPNETCORE_ENVIRONMENT=Production MongoDbSettings__ConnectionString=$MONGODB_CONN MongoDbSettings__DatabaseName=ClothStoreDb

# Wait and check
Start-Sleep -Seconds 15
az container show --resource-group myNewResourceGroup2 --name my-backend-container --query "containers[0].instanceView.restartCount"
az container logs --resource-group myNewResourceGroup2 --name my-backend-container
$FQDN = az container show --resource-group myNewResourceGroup2 --name my-backend-container --query "ipAddress.fqdn" -o tsv
Write-Host "API URL: http://${FQDN}:8080"
curl "http://${FQDN}:8080/health"
```

---

## What You Should See

✅ **Success indicators:**
- Restart count: 0
- Logs show: "Application starting in Docker/Azure..."
- Health endpoint returns: "Healthy"
- No "CrashLoopBackOff" errors

❌ **If it still crashes:**
- Check MongoDB connection string is correct
- Verify MongoDB Atlas allows Azure IP connections
- Check logs for specific error messages
