# 🚨 URGENT: Coolify White Screen Fix

## Root Cause
Your production build shows a white screen because **Vite environment variables are NOT being passed during the Docker build process in Coolify**.

## Immediate Fix Required

### Step 1: Add Build Variables in Coolify
In your Coolify application settings, add these **BUILD-TIME** environment variables:

```bash
VITE_SUPABASE_URL=https://opkqtpmmtvprhfyjmkhx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wa3F0cG1tdHZwcmhmeWpta2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzk1NTAsImV4cCI6MjA2MzYxNTU1MH0.0AGpsyD0KCZrwKfOhPatw08Kf1XyVgMhQA6_Uj8l4aU
VITE_APP_URL=https://your-actual-domain.com
VITE_ENVIRONMENT=production
VITE_USE_SUPABASE=true
```

**⚠️ IMPORTANT**: These must be set as BUILD variables, not runtime variables!

### Step 2: Update Dockerfile (Already Done)
Your Dockerfile correctly accepts these as build args:
```dockerfile
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_APP_URL
ARG VITE_ENVIRONMENT=production
```

### Step 3: Verify Build Process
The build should show environment variables being embedded:
```
✓ VITE_SUPABASE_URL is set
✓ Building with production environment
✓ 3963 modules transformed
```

## Test Locally First

```bash
# Test the production build locally
export VITE_SUPABASE_URL=https://opkqtpmmtvprhfyjmkhx.supabase.co
export VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wa3F0cG1tdHZwcmhmeWpta2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzk1NTAsImV4cCI6MjA2MzYxNTU1MH0.0AGpsyD0KCZrwKfOhPatw08Kf1XyVgMhQA6_Uj8l4aU
export VITE_APP_URL=http://localhost:4173
export VITE_ENVIRONMENT=production

# Clean build
rm -rf dist
npm run build

# Test it
npm run preview
# Open http://localhost:4173
```

## Debugging in Coolify

1. Check build logs for "VITE_" variables
2. Ensure variables are in the "Build Variables" section, not "Runtime Variables"
3. Look for these in build output:
   - `ENV VITE_SUPABASE_URL=https://...` (should show actual URL, not variable reference)
   - No errors about missing environment variables

## Why This Happens

1. **Vite embeds env vars at BUILD time** - they become part of the JavaScript code
2. **Docker builds in isolation** - it can't see your .env file
3. **Coolify must pass vars to Docker** - as build arguments
4. **Without vars, Supabase fails** - causing immediate crash and white screen

## Success Indicators

✅ Build completes without warnings about missing env vars  
✅ Built JS files contain actual Supabase URL (not undefined)  
✅ No console errors about "Missing VITE_SUPABASE_URL"  
✅ App loads and shows content, not white screen  

## Need Help?

If still showing white screen after adding build vars:
1. Check browser console for specific errors
2. Verify Coolify is passing build args (check build logs)
3. Ensure no typos in environment variable names
4. Try building locally with same vars to verify they work