# GitHub Actions CI/CD Setup

This guide explains how to set up automated deployments to Azure using GitHub Actions.

## Prerequisites

1. Azure resources already created (ACR, App Service)
2. GitHub repository for your project
3. Azure CLI installed locally

## Step 1: Create Azure Service Principal

Run this command to create a service principal with contributor access:

```powershell
$subscriptionId = az account show --query id -o tsv
$resourceGroup = "clothstore-rg"

az ad sp create-for-rbac `
  --name "clothstore-github-actions" `
  --role contributor `
  --scopes /subscriptions/$subscriptionId/resourceGroups/$resourceGroup `
  --sdk-auth
```

**Important**: Copy the entire JSON output. You'll need it for the next step.

## Step 2: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

### 1. AZURE_CREDENTIALS
Paste the entire JSON output from Step 1. It should look like:
```json
{
  "clientId": "...",
  "clientSecret": "...",
  "subscriptionId": "...",
  "tenantId": "...",
  ...
}
```

### 2. ACR_USERNAME
Get your ACR username:
```powershell
az acr credential show --name clothstoreacr --query username -o tsv
```

### 3. ACR_PASSWORD
Get your ACR password:
```powershell
az acr credential show --name clothstoreacr --query passwords[0].value -o tsv
```

## Step 3: Update Workflow File (if needed)

The workflow file is located at `.github/workflows/deploy-backend.yml`

Update these environment variables if you used different names:
```yaml
env:
  AZURE_WEBAPP_NAME: clothstore-api    # Your App Service name
  ACR_NAME: clothstoreacr              # Your ACR name
  IMAGE_NAME: clothstoreapi            # Your Docker image name
```

## Step 4: Push to GitHub

```powershell
git add .
git commit -m "Add Azure deployment workflow"
git push origin main
```

The workflow will automatically trigger on:
- Push to `main` or `master` branch
- Changes in the `ClothStoreApi/` directory
- Manual trigger from GitHub Actions tab

## Step 5: Monitor Deployment

1. Go to your GitHub repository
2. Click on "Actions" tab
3. Watch the workflow run in real-time
4. Check the logs for any errors

## Workflow Steps

The automated workflow performs these steps:

1. ✅ Checkout code
2. ✅ Login to Azure
3. ✅ Login to Azure Container Registry
4. ✅ Build Docker image
5. ✅ Push image to ACR (with commit SHA and latest tags)
6. ✅ Deploy to Azure App Service
7. ✅ Verify deployment (health check)
8. ✅ Logout from Azure

## Manual Trigger

You can also manually trigger the workflow:

1. Go to Actions tab in GitHub
2. Select "Deploy Backend to Azure"
3. Click "Run workflow"
4. Select branch and click "Run workflow"

## Troubleshooting

### Authentication Failed
- Verify `AZURE_CREDENTIALS` secret is correct
- Check if service principal has proper permissions
- Ensure subscription ID is correct

### ACR Login Failed
- Verify `ACR_USERNAME` and `ACR_PASSWORD` secrets
- Check if ACR admin user is enabled:
  ```powershell
  az acr update --name clothstoreacr --admin-enabled true
  ```

### Deployment Failed
- Check App Service logs:
  ```powershell
  az webapp log tail --name clothstore-api --resource-group clothstore-rg
  ```
- Verify environment variables are set in Azure
- Check if the image was pushed successfully to ACR

### Health Check Failed
- Verify the `/health` endpoint is working
- Check if the app is running:
  ```powershell
  az webapp show --name clothstore-api --resource-group clothstore-rg --query state
  ```

## Best Practices

1. **Use staging slots** for zero-downtime deployments
2. **Tag images** with commit SHA for traceability
3. **Run tests** before deployment (add test step to workflow)
4. **Monitor deployments** with Application Insights
5. **Use environments** in GitHub for approval gates

## Advanced: Staging Slot Deployment

To add a staging slot for safer deployments:

```powershell
# Create staging slot
az webapp deployment slot create `
  --name clothstore-api `
  --resource-group clothstore-rg `
  --slot staging

# Update workflow to deploy to staging first, then swap
```

Update the workflow to include slot swap:
```yaml
- name: Deploy to staging slot
  uses: azure/webapps-deploy@v2
  with:
    app-name: ${{ env.AZURE_WEBAPP_NAME }}
    slot-name: staging
    images: ${{ env.ACR_NAME }}.azurecr.io/${{ env.IMAGE_NAME }}:${{ github.sha }}

- name: Swap staging to production
  run: |
    az webapp deployment slot swap \
      --name ${{ env.AZURE_WEBAPP_NAME }} \
      --resource-group clothstore-rg \
      --slot staging \
      --target-slot production
```

## Cost Optimization

- Workflow runs are free for public repositories
- Private repositories: 2,000 minutes/month free (GitHub Free)
- Consider using self-hosted runners for unlimited minutes

## Security Notes

- Never commit secrets to the repository
- Rotate service principal credentials regularly
- Use Azure Key Vault for sensitive configuration
- Enable branch protection rules for main branch
