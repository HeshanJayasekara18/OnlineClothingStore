# Fix Google OAuth - Authorization Error

## 🎯 Your Vercel URL
**https://online-clothing-store-umber.vercel.app**

---

## ✅ Step-by-Step Fix

### Step 1: Open Google Cloud Console

Go to: **https://console.cloud.google.com/apis/credentials**

### Step 2: Find Your OAuth Client

Look for the OAuth 2.0 Client ID:
- **Client ID:** `337988956225-np362jqlp8nhscqq76hmbsqfh3fjsvme`
- Click on it to **edit**

### Step 3: Add Authorized JavaScript Origins

In the **"Authorized JavaScript origins"** section, add these URLs:

```
https://online-clothing-store-umber.vercel.app
http://localhost:3000
https://localhost:3000
```

**Copy-paste ready format:**
```
https://online-clothing-store-umber.vercel.app
```

### Step 4: Add Authorized Redirect URIs

In the **"Authorized redirect URIs"** section, add these URLs:

```
https://online-clothing-store-umber.vercel.app/auth/callback
https://clothstoreapiapp.azurewebsites.net/signin-google
http://localhost:3000/auth/callback
```

**Copy-paste ready format:**
```
https://online-clothing-store-umber.vercel.app/auth/callback
https://clothstoreapiapp.azurewebsites.net/signin-google
http://localhost:3000/auth/callback
```

### Step 5: Save Changes

1. Click **"Save"** at the bottom
2. Wait **5-10 minutes** for changes to propagate

---

## 🧪 Test After 10 Minutes

1. Go to: **https://online-clothing-store-umber.vercel.app/auth**
2. Click **"Sign in with Google"**
3. Should work without the `origin_mismatch` error

---

## 📸 Visual Guide

### What to Add:

**Authorized JavaScript origins:**
- ✅ `https://online-clothing-store-umber.vercel.app`
- ✅ `http://localhost:3000`
- ✅ `https://localhost:3000`

**Authorized redirect URIs:**
- ✅ `https://online-clothing-store-umber.vercel.app/auth/callback`
- ✅ `https://clothstoreapiapp.azurewebsites.net/signin-google`
- ✅ `http://localhost:3000/auth/callback`

---

## 🐛 Still Not Working?

### Check These:

1. **Wait 10 minutes** - Google OAuth changes take time
2. **Clear browser cache** - Old OAuth tokens might be cached
3. **Try incognito mode** - Fresh browser session
4. **Check exact URL** - Make sure no trailing slashes or typos

### Verify Environment Variables in Vercel:

Make sure these are set:
- `REACT_APP_API_URL` = `https://clothstoreapiapp.azurewebsites.net`
- `REACT_APP_GOOGLE_CLIENT_ID` = `337988956225-np362jqlp8nhscqq76hmbsqfh3fjsvme.apps.googleusercontent.com`

---

## ✅ Checklist

- [ ] Opened Google Cloud Console
- [ ] Found OAuth 2.0 Client ID
- [ ] Added Vercel URL to JavaScript origins
- [ ] Added redirect URIs
- [ ] Clicked Save
- [ ] Waited 10 minutes
- [ ] Tested Google Sign In
- [ ] Success! 🎉

---

**Need Help?**
- Google Cloud Console: https://console.cloud.google.com/apis/credentials
- Your Vercel App: https://online-clothing-store-umber.vercel.app
- Your Backend: https://clothstoreapiapp.azurewebsites.net
