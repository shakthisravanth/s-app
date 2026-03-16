# Production Deployment Guide

## ✅ Fixed Issues

This configuration fixes the "Page Not Found" errors that occur when:
- Refreshing pages in production
- Directly accessing routes like `/student-dashboard`
- Navigating to deep links

## 🔧 What Was Fixed

### 1. **Vite Configuration** (`vite.config.js`)
- Set `base: '/'` for proper absolute path routing
- Added sourcemaps for debugging
- Configured build output directory

### 2. **SPA Fallback** (`public/_redirects`)
- Created redirect rule to serve `index.html` for all routes
- This ensures React Router handles all client-side routing

### 3. **Nginx Configuration** (`nginx.conf`)
- Added `try_files $uri $uri/ /index.html;` directive
- This is CRITICAL for React Router to work on page refresh

## 🚀 Deployment Steps for Railway

### Option 1: Automatic Deployment (Recommended)

1. **Push to GitHub/GitLab**
   ```bash
   git add .
   git commit -m "Configure for production deployment"
   git push origin main
   ```

2. **Connect Railway to your repository**
   - Go to Railway dashboard
   - Create new project → Deploy from GitHub
   - Select your repository

3. **Railway will automatically detect it's a Vite app and:**
   - Run `npm run build`
   - Serve the `dist` folder with proper routing

### Option 2: Manual Deployment

```bash
# 1. Build the project
npm run build

# 2. Preview locally (optional)
npm run preview

# 3. Deploy to Railway
# Upload the 'dist' folder contents to Railway
```

## 🎯 How It Works

### Before (Broken):
```
User visits: /student-dashboard
Server looks for: /student-dashboard folder/file
Result: 404 Not Found ❌
```

### After (Fixed):
```
User visits: /student-dashboard
Server sees: No file exists, serves /index.html
React Router loads: Takes over and shows StudentDashboard component
Result: Page loads successfully ✅
```

## 📁 Files Modified/Created

- ✅ `vite.config.js` - Updated base path and build config
- ✅ `index.html` - Removed conflicting base tag
- ✅ `public/_redirects` - NEW: SPA redirect rule
- ✅ `nginx.conf` - NEW: Server routing configuration

## 🔍 Testing Before Deployment

Run these commands to test locally:

```bash
# Build the production version
npm run build

# Serve the production build locally
npm run preview

# Test these URLs in your browser:
# - http://localhost:4173/
# - http://localhost:4173/student-dashboard
# - http://localhost:4173/my-learnings
# - Refresh any of these pages - should work!
```

## ⚙️ Environment Variables

If you need API keys or environment variables:

1. Create `.env.production` file:
   ```
   VITE_API_BASE_URL=https://incred-demo-production.up.railway.app
   ```

2. Access in code:
   ```javascript
   const apiUrl = import.meta.env.VITE_API_BASE_URL;
   ```

## 🐛 Troubleshooting

### Still getting 404 on refresh?

1. **Check Railway logs** - Make sure it's serving from the correct directory
2. **Verify _redirects file** - It should be in the `public` folder and copied to `dist`
3. **Clear browser cache** - Old service workers might interfere

### Assets not loading?

1. Check browser console for CORS errors
2. Verify the `base` path in `vite.config.js` matches your deployment URL
3. Make sure all asset paths are absolute (starting with `/`)

## 📞 Support

If issues persist, check:
- Railway deployment logs
- Browser developer console (F12)
- Network tab for failed requests

---

**Last Updated**: March 16, 2026
**Configuration Version**: v1.0 (Production Ready)
