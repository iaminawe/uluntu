# Coolify Deployment Fix Guide

## Problem Summary
Your app shows a white screen on Coolify deployment (https://nelson-tech.apps.iaminawe.net) while working fine locally. The root cause is that **Coolify is not passing the build-time environment variables to Docker**.

## Root Cause
Vite requires environment variables at BUILD TIME, not runtime. These variables get embedded into the JavaScript files during `npm run build`. Without them, your Supabase client initialization fails, causing a white screen.

## Verified Solution

### 1. In Coolify Application Settings

Navigate to your application in Coolify and ensure these settings:

#### Build Variables Section (CRITICAL)
Add these variables in the **"Build Variables"** section (NOT "Environment Variables"):

```
VITE_SUPABASE_URL=https://opkqtpmmtvprhfyjmkhx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wa3F0cG1tdHZwcmhmeWpta2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzk1NTAsImV4cCI6MjA2MzYxNTU1MH0.0AGpsyD0KCZrwKfOhPatw08Kf1XyVgMhQA6_Uj8l4aU
VITE_APP_URL=https://nelson-tech.apps.iaminawe.net
VITE_ENVIRONMENT=production
VITE_USE_SUPABASE=true
```

Optional variables:
```
VITE_FROM_EMAIL=noreply@nelson-tech.apps.iaminawe.net
VITE_FROM_NAME=Nelson Tech
VITE_RESEND_API_KEY=your-resend-api-key
VITE_GOOGLE_ANALYTICS_ID=your-ga-id
VITE_SENTRY_DSN=your-sentry-dsn
VITE_ENABLE_NEWSLETTER=true
VITE_ENABLE_GALLERY=true
VITE_ENABLE_MARKETPLACE=true
VITE_ENABLE_GROUPS=true
VITE_ENABLE_EVENTS=true
```

#### Build Configuration
- **Dockerfile**: `Dockerfile.production` (already set in coolify.json)
- **Build Pack**: Docker

### 2. Verify Build Output

When Coolify builds your app, watch the build logs for:

1. **Environment variable echo** - You should see:
   ```
   Building with environment variables:
   VITE_SUPABASE_URL=https://opkqtpmmtvprhfyjmkhx.supabase.co
   VITE_APP_URL=https://nelson-tech.apps.iaminawe.net
   VITE_ENVIRONMENT=production
   ```

2. **Build verification** - You should see:
   ```
   ✅ Build verification passed - Supabase URL found in built files
   ```

   If you see this instead:
   ```
   ⚠️  WARNING: Supabase URL not found in built files
   ```
   Then the environment variables are NOT being passed correctly.

### 3. Alternative Solutions if Build Variables Don't Work

#### Option A: Use a .env.production file
1. Create `.env.production` in your repository:
   ```bash
   VITE_SUPABASE_URL=https://opkqtpmmtvprhfyjmkhx.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   # ... other variables
   ```

2. Remove from `.gitignore` (temporarily for deployment)

#### Option B: Modify Dockerfile to hardcode values (NOT RECOMMENDED)
Only as a last resort, modify Dockerfile.production to hardcode the values:
```dockerfile
ENV VITE_SUPABASE_URL="https://opkqtpmmtvprhfyjmkhx.supabase.co"
ENV VITE_SUPABASE_ANON_KEY="your-anon-key"
```

### 4. Test Locally First

Before deploying to Coolify, test the exact same build process locally:

```bash
# Build with the same arguments Coolify should use
docker build -f Dockerfile.production -t nelson-tech-test \
  --build-arg VITE_SUPABASE_URL=https://opkqtpmmtvprhfyjmkhx.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=your-anon-key \
  --build-arg VITE_APP_URL=https://nelson-tech.apps.iaminawe.net \
  --build-arg VITE_ENVIRONMENT=production \
  .

# Run it
docker run -p 3000:80 nelson-tech-test

# Test it
open http://localhost:3000
```

### 5. Debug in Production

If the white screen persists after deployment:

1. **Check browser console** at https://nelson-tech.apps.iaminawe.net
   - Look for errors about undefined Supabase variables
   - Check for 404 errors on assets

2. **Use the test page**: `/test-deployment.html`
   - This will show if environment variables are present

3. **Check nginx logs** in Coolify:
   ```
   docker logs <container-id>
   ```

## Common Issues

### Issue 1: Build Variables vs Environment Variables
- **Build Variables**: Used during `docker build` (REQUIRED for Vite)
- **Environment Variables**: Used at runtime (NOT useful for Vite)

### Issue 2: Variable Format in Coolify
Make sure you're entering them as:
```
VITE_SUPABASE_URL=https://...
```
NOT as:
```
${VITE_SUPABASE_URL}
```

### Issue 3: Cache Issues
If you've deployed before with missing variables:
1. Clear Coolify build cache
2. Force a new deployment
3. Check that new JavaScript files are being served

## Success Indicators

When properly configured, you should see:
1. ✅ Build logs show environment variables being set
2. ✅ Build verification passes
3. ✅ No white screen - app loads normally
4. ✅ Browser console shows no Supabase initialization errors
5. ✅ Network tab shows successful API calls to Supabase

## Need Help?

If the white screen persists:
1. Check the browser console for specific errors
2. Verify the build logs in Coolify
3. Test the Docker build locally first
4. Ensure you're using Dockerfile.production
5. Check that coolify.json is committed to your repository