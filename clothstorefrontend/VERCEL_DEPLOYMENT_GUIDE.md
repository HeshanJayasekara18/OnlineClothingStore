# Vercel Deployment Guide - Connect Frontend to Azure Backend

## ✅ Backend Configuration Complete

Your Azure backend is now configured to accept requests from Vercel deployments!

**Backend URL:** `https://clothstoreapiapp.azurewebsites.net`

---

## 🚀 Configure Vercel Environment Variables

### Step 1: Go to Your Vercel Project Settings

1. Open your Vercel dashboard: https://vercel.com/dashboard
2. Select your deployed project
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Environment Variables

Add the following environment variable:

| Name | Value |
|------|-------|
| `REACT_APP_API_URL` | `https://clothstoreapiapp.azurewebsites.net` |
| `REACT_APP_GOOGLE_CLIENT_ID` | `337988956225-np362jqlp8nhscqq76hmbsqfh3fjsvme.apps.googleusercontent.com` |

**Important:** Make sure to select all environments (Production, Preview, Development)

### Step 3: Redeploy Your Application

After adding the environment variables, you need to redeploy:

**Option A: Redeploy from Vercel Dashboard**
1. Go to **Deployments** tab
2. Click the three dots (⋮) on your latest deployment
3. Click **Redeploy**

**Option B: Redeploy by Pushing to Git**
```bash
cd "d:\Projects\Cothing Store\clothstorefrontend"
git add .
git commit -m "Update environment configuration"
git push
```

---

## 🧪 Test the Connection

After redeployment, test these endpoints from your Vercel app:

1. **Health Check:**
   ```
   https://clothstoreapiapp.azurewebsites.net/health
   ```

2. **API Root:**
   ```
   https://clothstoreapiapp.azurewebsites.net/
   ```

3. **Swagger UI:**
   ```
   https://clothstoreapiapp.azurewebsites.net/swagger
   ```

---

## 🔧 Local Development

For local development, create a `.env` file in the frontend directory:

```bash
# .env (for local development only)
REACT_APP_API_URL=https://clothstoreapiapp.azurewebsites.net
REACT_APP_GOOGLE_CLIENT_ID=337988956225-np362jqlp8nhscqq76hmbsqfh3fjsvme.apps.googleusercontent.com
```

**Note:** The `.env` file is gitignored for security. Use `.env.example` as a template.

---

## ✅ What Was Fixed

### Backend Changes:
- ✅ **CORS Configuration:** Updated to allow all `*.vercel.app` domains
- ✅ **Swagger Enabled:** Now accessible in production at `/swagger`
- ✅ **Redeployed:** Latest Docker image pushed to Azure

### Frontend Setup:
- ✅ **Environment Variable:** `REACT_APP_API_URL` configured
- ✅ **Example File:** Created `.env.example` for reference

---

## 🐛 Troubleshooting

### Issue: "Network Error" or "CORS Error"

**Solution:**
1. Verify environment variable is set in Vercel
2. Redeploy after adding environment variables
3. Check browser console for specific error messages

### Issue: API calls go to localhost

**Solution:**
- Environment variable not set correctly in Vercel
- Redeploy after adding `REACT_APP_API_URL`

### Issue: 404 on API endpoints

**Solution:**
- Verify backend is running: https://clothstoreapiapp.azurewebsites.net/health
- Check API endpoint paths in your frontend code

---

## 📝 Quick Commands

### Check Backend Status
```bash
curl https://clothstoreapiapp.azurewebsites.net/health
```

### View Vercel Environment Variables
```bash
vercel env ls
```

### Add Environment Variable via CLI
```bash
vercel env add REACT_APP_API_URL
# Enter: https://clothstoreapiapp.azurewebsites.net
# Select: Production, Preview, Development
```

---

## 🎉 You're All Set!

Your frontend on Vercel should now successfully connect to your Azure backend!

**Next Steps:**
1. Add environment variables in Vercel dashboard
2. Redeploy your Vercel application
3. Test the connection
4. Monitor for any errors in Vercel logs

---

**Need Help?**
- Vercel Logs: https://vercel.com/[your-project]/deployments
- Azure Logs: `az webapp log tail --name clothstoreapiapp --resource-group clothstoreGroupCentral`
