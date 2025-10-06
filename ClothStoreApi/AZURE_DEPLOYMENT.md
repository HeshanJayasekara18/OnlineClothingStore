# Azure Deployment Guide for ClothStore API

## Prerequisites
- Azure CLI installed: `az --version`
- Docker installed and running
- Azure subscription with appropriate permissions

## Step 1: Login to Azure
```powershell
az login
az account set --subscription "<your-subscription-id>"
```

## Step 2: Create Azure Container Registry (ACR)
```powershell
# Set variables
$RESOURCE_GROUP = "clothstore-rg"
$LOCATION = "eastus"
$ACR_NAME = "clothstoreacr"  # Must be globally unique, lowercase alphanumeric only
$APP_NAME = "clothstore-api"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create ACR
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --admin-enabled true

# Get ACR credentials
az acr credential show --name $ACR_NAME
```

## Step 3: Build and Push Docker Image to ACR

### Option A: Build locally and push
```powershell
# Login to ACR
az acr login --name $ACR_NAME

# Tag the image
docker tag clothstoreapi:latest $ACR_NAME.azurecr.io/clothstoreapi:latest

# Push to ACR
docker push $ACR_NAME.azurecr.io/clothstoreapi:latest
```

### Option B: Build directly in ACR (recommended)
```powershell
# Build and push in one command
az acr build --registry $ACR_NAME --image clothstoreapi:latest --file Dockerfile .
```

## Step 4: Deploy to Azure App Service (Web App for Containers)

```powershell
# Create App Service Plan (Linux)
az appservice plan create `
  --name "$APP_NAME-plan" `
  --resource-group $RESOURCE_GROUP `
  --is-linux `
  --sku B1

# Create Web App
az webapp create `
  --resource-group $RESOURCE_GROUP `
  --plan "$APP_NAME-plan" `
  --name $APP_NAME `
  --deployment-container-image-name "$ACR_NAME.azurecr.io/clothstoreapi:latest"

# Configure ACR credentials for the Web App
$ACR_USERNAME = az acr credential show --name $ACR_NAME --query username -o tsv
$ACR_PASSWORD = az acr credential show --name $ACR_NAME --query passwords[0].value -o tsv

az webapp config container set `
  --name $APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --docker-custom-image-name "$ACR_NAME.azurecr.io/clothstoreapi:latest" `
  --docker-registry-server-url "https://$ACR_NAME.azurecr.io" `
  --docker-registry-server-user $ACR_USERNAME `
  --docker-registry-server-password $ACR_PASSWORD

# Enable continuous deployment (webhook)
az webapp deployment container config `
  --name $APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --enable-cd true
```

## Step 5: Configure Environment Variables

```powershell
# Set application settings (environment variables)
az webapp config appsettings set `
  --name $APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --settings `
    DOTNET_RUNNING_IN_CONTAINER="true" `
    MongoDbSettings__ConnectionString="<your-mongodb-connection-string>" `
    MongoDbSettings__DatabaseName="ClothStoreDb" `
    MongoDbSettings__CustomersCollection="Customers" `
    MongoDbSettings__ProductsCollection="Products" `
    MongoDbSettings__OrdersCollection="Orders" `
    Authentication__Google__ClientId="<your-google-client-id>" `
    Authentication__Google__ClientSecret="<your-google-client-secret>" `
    OpenAI__Endpoint="<your-openai-endpoint>" `
    OpenAI__ApiKey="<your-openai-key>" `
    Gemini__ApiKey="<your-gemini-key>"
```

## Step 6: Configure CORS for Frontend

Update CORS in your Web App to allow your frontend domain:
```powershell
az webapp cors add `
  --name $APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --allowed-origins "https://your-frontend-domain.com"
```

## Step 7: Enable Logging (Optional but Recommended)

```powershell
# Enable container logging
az webapp log config `
  --name $APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --docker-container-logging filesystem

# Stream logs
az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP
```

## Step 8: Verify Deployment

```powershell
# Get the Web App URL
az webapp show --name $APP_NAME --resource-group $RESOURCE_GROUP --query defaultHostName -o tsv

# Test the API
curl https://$APP_NAME.azurewebsites.net/health
curl https://$APP_NAME.azurewebsites.net/
```

## Updating the Application

When you make changes to your code:

```powershell
# Rebuild and push to ACR
az acr build --registry $ACR_NAME --image clothstoreapi:latest --file Dockerfile .

# Restart the web app (it will pull the latest image)
az webapp restart --name $APP_NAME --resource-group $RESOURCE_GROUP
```

## Alternative: Deploy to Azure Container Instances (ACI)

For simpler deployments without App Service:

```powershell
az container create `
  --resource-group $RESOURCE_GROUP `
  --name $APP_NAME `
  --image "$ACR_NAME.azurecr.io/clothstoreapi:latest" `
  --registry-login-server "$ACR_NAME.azurecr.io" `
  --registry-username $ACR_USERNAME `
  --registry-password $ACR_PASSWORD `
  --dns-name-label $APP_NAME `
  --ports 80 `
  --environment-variables `
    DOTNET_RUNNING_IN_CONTAINER="true" `
    MongoDbSettings__ConnectionString="<your-mongodb-connection-string>" `
    MongoDbSettings__DatabaseName="ClothStoreDb"
```

## Troubleshooting

### View logs
```powershell
az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP
```

### Check container status
```powershell
az webapp show --name $APP_NAME --resource-group $RESOURCE_GROUP --query state
```

### Restart the app
```powershell
az webapp restart --name $APP_NAME --resource-group $RESOURCE_GROUP
```

## Cost Optimization

- **B1 tier**: ~$13/month (suitable for development)
- **P1V2 tier**: ~$73/month (production with better performance)
- **Container Instances**: Pay per second of usage

## Security Best Practices

1. ✅ Store secrets in **Azure Key Vault** instead of environment variables
2. ✅ Use **Managed Identity** for accessing Azure resources
3. ✅ Enable **HTTPS only** in production
4. ✅ Configure **custom domain** with SSL certificate
5. ✅ Set up **Application Insights** for monitoring

## Next Steps

1. Set up custom domain
2. Configure SSL certificate
3. Set up Azure Key Vault for secrets
4. Configure Application Insights
5. Set up CI/CD with GitHub Actions or Azure DevOps
