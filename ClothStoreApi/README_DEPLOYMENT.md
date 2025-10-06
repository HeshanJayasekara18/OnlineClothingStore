# Deploy to Azure with GitHub Actions

Clean, automated deployment to Azure Container Instances using GitHub Actions.

## Quick Setup (5 Steps)

### Step 1: Get Azure Subscription ID

```powershell
az account show --query id -o tsv
```

### Step 2: Create Service Principal

Replace `YOUR_SUBSCRIPTION_ID`:

```powershell
az ad sp create-for-rbac --name "github-actions-clothstore" --role contributor --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/myNewResourceGroup2 --sdk-auth
```

Copy the entire JSON output.

### Step 3: Add GitHub Secrets

Go to: **GitHub Repository → Settings → Secrets and variables → Actions**

Add these 4 secrets:

| Secret Name | Value |
|------------|-------|
| `AZURE_CREDENTIALS` | Paste JSON from Step 2 |
| `ACR_USERNAME` | Run: `az acr credential show --name clothstoreacr123 --query username -o tsv` |
| `ACR_PASSWORD` | Run: `az acr credential show --name clothstoreacr123 --query passwords[0].value -o tsv` |
| `MONGODB_CONNECTION_STRING` | Your MongoDB connection string |

### Step 4: Push to GitHub

```powershell
git add .
git commit -m "Add GitHub Actions deployment"
git push origin main
```

### Step 5: Watch Deployment

Go to **GitHub → Actions** tab and watch it deploy automatically!

Your API will be at: `http://my-backend-app2.eastus2.azurecontainer.io:8080`

---

## What Gets Deployed

- **Workflow**: `.github/workflows/deploy-aci.yml`
- **Resource Group**: myNewResourceGroup2
- **Container Registry**: clothstoreacr123
- **Container**: my-backend-container
- **URL**: http://my-backend-app2.eastus2.azurecontainer.io:8080

---

## Manual Trigger

1. Go to **Actions** tab
2. Select **"Deploy to Azure Container Instances"**
3. Click **"Run workflow"**

---

## Monitor Deployment

### Check status:
```powershell
az container show --resource-group myNewResourceGroup2 --name my-backend-container --query "{State:instanceView.state,Restarts:containers[0].instanceView.restartCount}" -o table
```

### View logs:
```powershell
az container logs --resource-group myNewResourceGroup2 --name my-backend-container
```

### Test API:
```powershell
curl http://my-backend-app2.eastus2.azurecontainer.io:8080/health
```

---

## Troubleshooting

**Authentication failed**: Check `AZURE_CREDENTIALS` secret

**Cannot push to ACR**: Verify `ACR_USERNAME` and `ACR_PASSWORD` secrets

**Container restarts**: Check `MONGODB_CONNECTION_STRING` and MongoDB Atlas allows Azure IPs

**Health check fails**: Wait 30 seconds for container to start
