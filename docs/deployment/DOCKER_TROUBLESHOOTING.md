# Docker Deployment Troubleshooting Guide

## 🔍 White Screen Issue

If you're seeing a white screen in Docker but the app works locally, here are the most common causes and solutions:

## 1. Environment Variables Not Being Passed During Build

**Problem**: Vite requires environment variables at **build time**, not runtime.

**Solution**: Update your Dockerfile to use build arguments:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# CRITICAL: Add build arguments
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Build with environment variables
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN npm run build
```

**Build command with arguments**:
```bash
docker build \
  --build-arg VITE_SUPABASE_URL="https://opkqtpmmtvprhfyjmkhx.supabase.co" \
  --build-arg VITE_SUPABASE_ANON_KEY="your-anon-key" \
  -t nelson-tech .
```

## 2. Checking Browser Console

Open browser DevTools (F12) and check:

### Common Console Errors:

1. **"Failed to fetch" or CORS errors**
   - Supabase URL is incorrect
   - Missing or invalid anon key
   
2. **"Cannot read property of undefined"**
   - Environment variables are undefined
   - Check if `import.meta.env.VITE_SUPABASE_URL` is undefined

3. **404 errors for JS/CSS files**
   - nginx configuration issue
   - Check base URL in index.html

## 3. Docker Compose with Build Args

Update your `docker-compose.yml`:

```yaml
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
        - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
```

## 4. Debugging Steps

### Step 1: Verify Environment Variables
```bash
# Check your .env file
cat .env | grep VITE_

# Ensure they're exported for Docker
export $(cat .env | grep VITE_ | xargs)
```

### Step 2: Build with Debug Output
```bash
# Use the debug Dockerfile
docker build -f Dockerfile.debug \
  --build-arg VITE_SUPABASE_URL="${VITE_SUPABASE_URL}" \
  --build-arg VITE_SUPABASE_ANON_KEY="${VITE_SUPABASE_ANON_KEY}" \
  -t nelson-tech-debug .
```

### Step 3: Inspect Built Files
```bash
# Check if env vars made it into the build
docker run --rm nelson-tech-debug \
  grep -r "supabase.co" /usr/share/nginx/html
```

### Step 4: Check Container Logs
```bash
# nginx logs
docker logs <container-name>

# Access logs
docker exec <container-name> tail -f /var/log/nginx/access.log

# Error logs
docker exec <container-name> tail -f /var/log/nginx/error.log
```

## 5. Quick Fix Script

Create `fix-docker-build.sh`:

```bash
#!/bin/bash

# Load environment variables
source .env

# Build with all required args
docker build \
  --build-arg VITE_SUPABASE_URL="${VITE_SUPABASE_URL}" \
  --build-arg VITE_SUPABASE_ANON_KEY="${VITE_SUPABASE_ANON_KEY}" \
  --build-arg VITE_APP_URL="${VITE_APP_URL:-http://localhost:3000}" \
  --build-arg VITE_ENVIRONMENT="${VITE_ENVIRONMENT:-production}" \
  -t nelson-tech-fixed .

# Run with port mapping
docker run -d \
  --name nelson-tech \
  -p 3000:80 \
  nelson-tech-fixed

echo "App running at http://localhost:3000"
echo "Check browser console for errors"
```

## 6. Coolify-Specific Issues

If deploying to Coolify:

1. **Environment Variables in Coolify**:
   - Set them in Coolify's UI, not just .env
   - Use the "Build Arguments" section for VITE_ variables

2. **Build Command Override**:
   ```yaml
   # In Coolify settings
   Build Command: npm run build
   Build Arguments:
     VITE_SUPABASE_URL: ${VITE_SUPABASE_URL}
     VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY}
   ```

## 7. Testing Locally with Docker

```bash
# 1. Create test env file
cat > .env.docker <<EOF
VITE_SUPABASE_URL=https://opkqtpmmtvprhfyjmkhx.supabase.co
VITE_SUPABASE_ANON_KEY=your-key-here
EOF

# 2. Build and run
docker-compose --env-file .env.docker up --build

# 3. Check at http://localhost:3000
```

## 8. Common Fixes Summary

✅ **Always use build args for VITE_ variables**
✅ **Check browser console first**
✅ **Verify Supabase URL includes https://**
✅ **Ensure anon key is valid**
✅ **Check nginx serves index.html for all routes**
✅ **Verify dist folder has built files**

## 9. Emergency Fallback

If nothing works, try the minimal Dockerfile:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci && npm run build
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

This bypasses nginx and uses Node.js directly.