# Environment Variables Diagnosis - White Screen Issue

## Problem Summary
The nelson-tech app shows a white screen on Coolify deployment because **environment variables are NOT being injected into the built JavaScript files**.

## Root Causes Identified

### 1. **Environment Variables Not in Built Files**
- The deployed JS files contain NO references to `supabase.co` or environment variables
- This means Vite didn't receive the environment variables during the build process
- The app crashes when trying to initialize Supabase with undefined values

### 2. **Build-Time vs Runtime Variables**
- Vite requires environment variables at **BUILD TIME**, not runtime
- Variables must be available when `npm run build` executes
- Once built, the variables are baked into the JavaScript files

### 3. **Docker Build Arguments Not Passed**
- The Dockerfile accepts ARG values but they may not be passed during Coolify build
- Coolify might not be passing build args correctly

## Critical Issues Found

### Issue 1: Hardcoded Supabase Enabled
In `src/config/env.ts`:
```typescript
// Temporary: force Supabase enabled for debugging
console.log('[config/env.ts] Forcing Supabase enabled for debugging');
return true;
```
This forces Supabase to be enabled even when environment variables are missing!

### Issue 2: Missing Environment Variables Validation
The app throws errors when variables are missing:
```typescript
if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL environment variable is required');
}
```

## Solutions

### Solution 1: Fix Coolify Build Configuration

**In Coolify, ensure these are set as BUILD variables:**

```yaml
# Build Variables (NOT Runtime Variables!)
VITE_SUPABASE_URL=https://opkqtpmmtvprhfyjmkhx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_URL=https://nelson-tech.apps.iaminawe.net
VITE_ENVIRONMENT=production
VITE_USE_SUPABASE=true
```

### Solution 2: Create Debug Dockerfile

Create `Dockerfile.debug` with environment variable logging:

```dockerfile
FROM node:20-alpine AS builder
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Accept and set ALL environment variables
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_APP_URL
ARG VITE_ENVIRONMENT=production
ARG VITE_USE_SUPABASE=true

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_APP_URL=$VITE_APP_URL
ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT
ENV VITE_USE_SUPABASE=$VITE_USE_SUPABASE

# Debug: Print all environment variables
RUN echo "=== BUILD TIME ENVIRONMENT VARIABLES ===" && \
    echo "VITE_SUPABASE_URL=$VITE_SUPABASE_URL" && \
    echo "VITE_SUPABASE_ANON_KEY=$(echo $VITE_SUPABASE_ANON_KEY | cut -c1-20)..." && \
    echo "VITE_APP_URL=$VITE_APP_URL" && \
    echo "VITE_ENVIRONMENT=$VITE_ENVIRONMENT" && \
    echo "VITE_USE_SUPABASE=$VITE_USE_SUPABASE"

# Build the app
RUN npm run build

# Verify environment variables are in the build
RUN echo "=== VERIFYING BUILD ===" && \
    if grep -q "supabase.co" dist/js/*.js 2>/dev/null; then \
        echo "✅ SUCCESS: Environment variables found in build"; \
    else \
        echo "❌ FAILURE: Environment variables NOT in build!"; \
        exit 1; \
    fi

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Solution 3: Fix env.ts Configuration

Remove the hardcoded return true:

```typescript
export function getIsSupabaseEnabled(): boolean {
  const envValue = getMetaEnvVariable('VITE_USE_SUPABASE');
  console.log('[config/env.ts] Dynamic check - VITE_USE_SUPABASE:', envValue);
  
  // Remove this hardcoded return!
  // return true;
  
  return envValue === 'true';
}
```

### Solution 4: Add Fallback Error Page

Create a user-friendly error when environment variables are missing:

```typescript
// src/lib/supabase.ts
if (!supabaseUrl || !supabaseAnonKey) {
  // Instead of throwing, show error UI
  document.getElementById('root')!.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1>Configuration Error</h1>
      <p>The application is not properly configured. Please contact support.</p>
      <details>
        <summary>Technical Details</summary>
        <pre>Missing environment variables:
        ${!supabaseUrl ? '- VITE_SUPABASE_URL\n' : ''}
        ${!supabaseAnonKey ? '- VITE_SUPABASE_ANON_KEY\n' : ''}
        </pre>
      </details>
    </div>
  `;
  throw new Error('Missing required environment variables');
}
```

## Verification Steps

1. **Check Coolify Build Logs:**
   - Look for "Building with environment variables:" section
   - Verify variables are printed (not empty)

2. **Test Built Files:**
   ```bash
   # SSH into container
   docker exec -it <container> sh
   
   # Check if variables are in build
   grep -r "supabase.co" /usr/share/nginx/html/js/
   ```

3. **Browser Console:**
   - Open DevTools (F12)
   - Look for errors like "Cannot read property of undefined"
   - Check Network tab for failed requests

## Quick Fix for Coolify

1. In Coolify, go to your application settings
2. Find "Build Variables" (NOT "Environment Variables")
3. Add all VITE_ variables there
4. Make sure to use the actual values from your .env file
5. Trigger a rebuild

## Alternative: Build Locally and Deploy

If Coolify continues to have issues:

```bash
# Build locally with variables
export VITE_SUPABASE_URL=https://opkqtpmmtvprhfyjmkhx.supabase.co
export VITE_SUPABASE_ANON_KEY=your-key-here
export VITE_APP_URL=https://nelson-tech.apps.iaminawe.net
npm run build

# Create a simple Dockerfile that just copies pre-built files
cat > Dockerfile.prebuilt << 'EOF'
FROM nginx:alpine
COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# Deploy this instead
```

## Summary

The white screen is caused by missing environment variables during the build process. Coolify needs to pass these as BUILD ARGUMENTS, not runtime environment variables. The variables must be available when `npm run build` executes, as Vite bakes them into the JavaScript files at build time.