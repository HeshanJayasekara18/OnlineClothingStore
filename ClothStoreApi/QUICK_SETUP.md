# 🚀 Quick Setup - Gemini API

## Step 1: Get Your Gemini API Key

**Click this link:** https://aistudio.google.com/app/apikey

1. Sign in with your Google account
2. Click **"Create API Key"**
3. Select a project (or create new)
4. **Copy the API key** (starts with `AIza...`)

---

## Step 2: Run the Setup Script

Open PowerShell in this directory and run:

```powershell
.\setup-gemini.ps1 -GeminiApiKey "YOUR_API_KEY_HERE"
```

**Replace `YOUR_API_KEY_HERE` with your actual API key from Step 1**

---

## Step 3: Test It!

After the script completes, test your AI stylist:

**Frontend:** https://online-clothing-store-umber.vercel.app/assitant

**API Test:**
```powershell
curl -X POST https://clothstoreapiapp.azurewebsites.net/api/stylist/suggest `
  -H "Content-Type: application/json" `
  -d '{\"prompt\": \"I have a birthday party and want to look elegant. Size XL.\"}'
```

---

## ✅ That's It!

Your AI Fashion Stylist is ready to use! 🎉
