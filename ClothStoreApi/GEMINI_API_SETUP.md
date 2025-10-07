# Gemini API Setup Guide

## 🎯 Get Your Gemini API Key

### Step 1: Go to Google AI Studio
Visit: **https://makersuite.google.com/app/apikey**

Or: **https://aistudio.google.com/app/apikey**

### Step 2: Create API Key
1. Click **"Get API Key"** or **"Create API Key"**
2. Select your Google Cloud project (or create a new one)
3. Click **"Create API key in existing project"** or **"Create API key in new project"**
4. Copy the API key (starts with `AIza...`)

---

## 🔧 Configure API Key in Azure

### Option 1: Using Azure Portal (Recommended)

1. Go to Azure Portal: https://portal.azure.com
2. Navigate to your Web App: **clothstoreapiapp**
3. Go to **Settings** → **Environment variables**
4. Click **+ Add**
5. Add this variable:
   - **Name:** `Gemini__ApiKey`
   - **Value:** `YOUR_GEMINI_API_KEY_HERE`
6. Click **Apply**
7. Restart the app

### Option 2: Using Azure CLI

```bash
az webapp config appsettings set \
  --name clothstoreapiapp \
  --resource-group clothstoreGroupCentral \
  --settings Gemini__ApiKey="YOUR_GEMINI_API_KEY_HERE"
```

Then restart:
```bash
az webapp restart \
  --name clothstoreapiapp \
  --resource-group clothstoreGroupCentral
```

---

## 🧪 Test the API

### Test Endpoint 1: Simple Suggestion
```bash
curl -X POST https://clothstoreapiapp.azurewebsites.net/api/stylist/suggest \
  -H "Content-Type: application/json" \
  -d "{\"prompt\": \"I have a birthday party and I want to look elegant. My size is XL.\"}"
```

### Test Endpoint 2: Suggestion with Products
```bash
curl -X POST https://clothstoreapiapp.azurewebsites.net/api/stylist/suggest-with-products \
  -H "Content-Type: application/json" \
  -d "{\"prompt\": \"I need casual wear for a coffee date. Size M, prefer blue colors.\"}"
```

---

## 📋 API Endpoints

### POST `/api/stylist/suggest`
Get AI-powered style suggestions based on user's situation.

**Request:**
```json
{
  "prompt": "I have a birthday party this weekend and I want to look elegant. My size is XL."
}
```

**Response:**
```json
{
  "suggestion": "For an elegant birthday party look in size XL, I recommend...",
  "prompt": "I have a birthday party..."
}
```

### POST `/api/stylist/suggest-with-products`
Get suggestions along with matching products from your store.

**Request:**
```json
{
  "prompt": "I need office wear, size L, budget around $100"
}
```

**Response:**
```json
{
  "suggestion": "For professional office wear...",
  "prompt": "I need office wear...",
  "availableProducts": [
    {
      "id": "...",
      "name": "Classic Blue Shirt",
      "category": "Shirts",
      "color": "Blue",
      "size": "L",
      "price": 45.99,
      "description": "...",
      "imageUrl": "..."
    }
  ]
}
```

---

## 🎨 Frontend Usage

The frontend is already configured! Users can:
1. Go to `/assitant` route
2. Describe their situation in natural language
3. Get AI-powered recommendations
4. See matching products from your store

**Example prompts:**
- "I have a birthday party this weekend and I want to look elegant. My size is XL."
- "I need casual wear for a coffee date. I prefer blue colors and my size is M."
- "Looking for professional office wear, size L, budget around $100."

---

## 🔒 Security Notes

- ✅ API key is stored as environment variable (not in code)
- ✅ Never commit API keys to Git
- ✅ Use Azure Key Vault for production (optional but recommended)

---

## 🐛 Troubleshooting

### Error: "Gemini API key not configured"
**Solution:** Add the `Gemini__ApiKey` environment variable in Azure

### Error: "Gemini API error: 400"
**Solution:** Check if your API key is valid and has the correct permissions

### Error: "Failed to get style suggestion"
**Solution:** 
1. Check Azure logs: `az webapp log tail --name clothstoreapiapp --resource-group clothstoreGroupCentral`
2. Verify API key is correct
3. Ensure Gemini API is enabled in Google Cloud Console

---

## ✅ Checklist

- [ ] Got Gemini API key from Google AI Studio
- [ ] Added `Gemini__ApiKey` to Azure environment variables
- [ ] Restarted Azure Web App
- [ ] Tested `/api/stylist/suggest` endpoint
- [ ] Tested frontend at `/assitant` route
- [ ] Success! 🎉

---

**Links:**
- Google AI Studio: https://aistudio.google.com/app/apikey
- Azure Portal: https://portal.azure.com
- Your Backend: https://clothstoreapiapp.azurewebsites.net
- Your Frontend: https://online-clothing-store-umber.vercel.app/assitant
