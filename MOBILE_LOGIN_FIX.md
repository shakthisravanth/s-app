# 🚨 CRITICAL: Mobile Login CORS Issue Fix

## Problem
Mobile devices are getting "Unable to fetch" error when trying to login. This is a **CORS (Cross-Origin Resource Sharing)** issue between:
- **Frontend**: Netlify (`https://your-app.netlify.app`)
- **Backend**: Railway (`https://incred-demo-production.up.railway.app`)

## ✅ Solution 1: Configure Backend CORS (REQUIRED)

The **Railway backend MUST be configured** to allow requests from your Netlify domain.

### Backend CORS Configuration (Node.js/Express Example):

```javascript
const cors = require('cors');

app.use(cors({
  origin: ['https://your-app.netlify.app', 'http://localhost:5173'], // Add your Netlify domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
```

### OR add these headers manually:

```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Or specific domain
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
```

## ✅ Solution 2: Use Environment Variables

Already configured! The app now uses:
- `.env` file for API URL configuration
- Works in both development and production

## 🔧 Deployment Steps

### 1. Build the App
```bash
npm run build
```

### 2. Deploy to Netlify
```bash
netlify deploy --prod
```

OR drag and drop the `dist` folder to Netlify dashboard.

### 3. Set Environment Variables on Netlify
Go to: **Netlify Dashboard → Site Settings → Environment Variables**

Add:
```
VITE_API_URL = https://incred-demo-production.up.railway.app
```

## 📱 Testing on Mobile

1. **Deploy to Netlify** (must use HTTPS)
2. **Open on mobile**: `https://your-app.netlify.app`
3. **Try logging in**
4. **Check console** for errors:
   - Open Safari on iOS: Settings → Safari → Advanced → Web Inspector
   - Open Chrome on Android: chrome://inspect

## 🐛 Debugging

If still not working, check browser console for:
- `"Fetching from: ..."` → Shows which API URL is being used
- `"Network/CORS error"` → Backend CORS not configured properly
- `"Failed to fetch"` → Network or CORS issue

## 📝 Files Modified

- ✅ `src/pages/Login.jsx` - Uses environment variables, better error handling
- ✅ `.env` - API URL configuration
- ✅ `vite.config.js` - Dev server proxy for local testing
- ✅ `netlify.toml` - Netlify deployment configuration

## ⚡ Quick Test

Run this in browser console on mobile:
```javascript
fetch('https://incred-demo-production.up.railway.app/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@example.com', password: 'test123' })
}).then(r => console.log('Status:', r.status)).catch(e => console.error('Error:', e));
```

If you get a CORS error, the backend needs to be configured!
