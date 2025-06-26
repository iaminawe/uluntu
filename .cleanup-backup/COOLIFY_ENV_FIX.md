# Coolify Environment Variables Fix Guide

## Quick Fix Steps

### 1. In Coolify Dashboard

1. Go to your application: `nelson-tech`
2. Click on **"Environment Variables"** tab
3. **IMPORTANT**: Look for **"Build Variables"** section (NOT "Runtime Variables")

### 2. Add Build Variables

Add these variables in the **BUILD VARIABLES** section:

```bash
VITE_SUPABASE_URL=https://opkqtpmmtvprhfyjmkhx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wa3F0cG1tdHZwcmhmeWpta2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzk1NTAsImV4cCI6MjA2MzYxNTU1MH0.0AGpsyD0KCZrwKfOhPatw08Kf1XyVgMhQA6_Uj8l4aU
VITE_APP_URL=https://nelson-tech.apps.iaminawe.net
VITE_ENVIRONMENT=production
VITE_USE_SUPABASE=true
VITE_FROM_EMAIL=newsletter@nelsontech.ca
VITE_FROM_NAME=Nelson Tech Community
```

### 3. Update Dockerfile Selection

Make sure Coolify is using `Dockerfile.production` which has the proper ARG declarations.

### 4. Trigger Rebuild

1. Click **"Redeploy"** or **"Deploy"**
2. Watch the build logs for these lines:
   ```
   Building with environment variables:
   VITE_SUPABASE_URL=https://opkqtpmmtvprhfyjmkhx.supabase.co
   VITE_APP_URL=https://nelson-tech.apps.iaminawe.net
   VITE_ENVIRONMENT=production
   ```

### 5. Verify Success

After deployment, check:
```bash
curl -s https://nelson-tech.apps.iaminawe.net/js/index-*.js | grep -o "supabase.co"
```

If you see `supabase.co` in the output, the environment variables were successfully injected!

## Alternative: Using Docker Compose in Coolify

If build variables don't work, try using Docker Compose:

1. In Coolify, switch to **"Docker Compose"** deployment
2. Use this configuration:

```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.production
      args:
        VITE_SUPABASE_URL: "https://opkqtpmmtvprhfyjmkhx.supabase.co"
        VITE_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wa3F0cG1tdHZwcmhmeWpta2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzk1NTAsImV4cCI6MjA2MzYxNTU1MH0.0AGpsyD0KCZrwKfOhPatw08Kf1XyVgMhQA6_Uj8l4aU"
        VITE_APP_URL: "https://nelson-tech.apps.iaminawe.net"
        VITE_ENVIRONMENT: "production"
        VITE_USE_SUPABASE: "true"
    ports:
      - "80:80"
```

## Testing with Debug Dockerfile

To get detailed logging, temporarily use `Dockerfile.debug`:

1. Rename `Dockerfile.debug` to `Dockerfile`
2. Deploy and check logs for:
   - "BUILD TIME ENVIRONMENT VARIABLES" section
   - "VERIFYING BUILD OUTPUT" section
   - Any ❌ ERROR messages

## Common Issues

### Issue: Variables show as empty in build logs
**Solution**: Make sure you're using BUILD variables, not runtime variables

### Issue: Still getting white screen after adding variables
**Solution**: Clear browser cache and check console for specific errors

### Issue: Build fails with "Environment variables not injected"
**Solution**: Double-check variable names and values in Coolify

## Emergency Workaround

If all else fails, build locally and push pre-built image:

```bash
# On your local machine
export VITE_SUPABASE_URL=https://opkqtpmmtvprhfyjmkhx.supabase.co
export VITE_SUPABASE_ANON_KEY=your-key-here
export VITE_APP_URL=https://nelson-tech.apps.iaminawe.net
export VITE_USE_SUPABASE=true

npm run build

# Create simple Dockerfile
cat > Dockerfile.prebuilt << 'EOF'
FROM nginx:alpine
COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# Build and push to registry
docker build -f Dockerfile.prebuilt -t your-registry/nelson-tech:latest .
docker push your-registry/nelson-tech:latest

# Use this image in Coolify
```