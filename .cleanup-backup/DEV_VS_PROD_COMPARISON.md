# Dev vs Production Comparison Report for Nelson Tech

## Executive Summary
The production build shows a white screen issue in Coolify while development works fine. After thorough analysis, I've identified several critical configuration differences and issues.

## 🔴 CRITICAL ISSUES FOUND

### 1. **Environment Variables Not Being Injected During Build**
- **Problem**: Vite environment variables MUST be available at BUILD TIME, not runtime
- **Current Issue**: Docker build args are defined but may not be passed correctly in Coolify
- **Evidence**: 
  ```dockerfile
  ARG VITE_SUPABASE_URL
  ARG VITE_SUPABASE_ANON_KEY
  ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
  ```
- **Impact**: Without these vars, Supabase client initialization fails, causing white screen

### 2. **Hardcoded Debug Flag in Environment Config**
- **Location**: `/src/config/env.ts`
- **Issue**: Force-enabled Supabase with debug comment:
  ```typescript
  // Temporary: force Supabase enabled for debugging
  console.log('[config/env.ts] Forcing Supabase enabled for debugging');
  return true;
  ```
- **Impact**: This bypasses environment variable checks

### 3. **Development-Only Dependencies in Production**
- **ReactQueryDevtools**: Imported in main.tsx but should be conditionally loaded
- **Debug Components**: DebugUserRoles, SettingsDebugger commented out but still imported
- **Logger**: Uses `import.meta.env.DEV` which may not work in production builds

### 4. **Missing Production Environment Variables**
- **Required but potentially missing in Coolify**:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_APP_URL`
  - `VITE_ENVIRONMENT`

## 📊 Configuration Differences

### Development (Working):
```
- Port: 5555 (Vite dev server)
- Environment: import.meta.env available at runtime
- Hot Module Replacement: Enabled
- Source Maps: Inline
- Environment Variables: Loaded from .env file
- Supabase URL: https://opkqtpmmtvprhfyjmkhx.supabase.co
```

### Production (White Screen):
```
- Port: 80 (Nginx)
- Environment: Static build, no runtime env loading
- Hot Module Replacement: Disabled
- Source Maps: External
- Environment Variables: Must be injected at build time
- Supabase URL: May be undefined if not passed during build
```

## 🔧 CONCRETE FIXES NEEDED

### 1. **Fix Docker Build Arguments**
```dockerfile
# Ensure build args are passed correctly
RUN echo "VITE_SUPABASE_URL at build: $VITE_SUPABASE_URL" && \
    npm run build
```

### 2. **Remove Debug Code**
```typescript
// src/config/env.ts
export function getIsSupabaseEnabled(): boolean {
  const envValue = getMetaEnvVariable('VITE_USE_SUPABASE');
  console.log('[config/env.ts] VITE_USE_SUPABASE:', envValue);
  return envValue === 'true'; // Remove force-enable
}
```

### 3. **Conditional Dev Dependencies**
```typescript
// src/main.tsx
const ReactQueryDevtools = import.meta.env.PROD 
  ? () => null 
  : React.lazy(() => import('@tanstack/react-query-devtools').then(m => ({ default: m.ReactQueryDevtools })));
```

### 4. **Add Build-Time Validation**
```javascript
// vite.config.ts
export default defineConfig(({ mode }) => {
  if (mode === 'production') {
    const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
    for (const key of required) {
      if (!process.env[key]) {
        throw new Error(`Missing required env var: ${key}`);
      }
    }
  }
  // ... rest of config
});
```

### 5. **Coolify Configuration**
Ensure these environment variables are set in Coolify's build settings:
```
VITE_SUPABASE_URL=https://opkqtpmmtvprhfyjmkhx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_APP_URL=https://your-production-url.com
VITE_ENVIRONMENT=production
```

## 🚀 Migration Steps

1. **Update Coolify build variables** with all VITE_ prefixed vars
2. **Remove debug code** from env.ts
3. **Fix conditional imports** for dev tools
4. **Add build validation** to catch missing env vars early
5. **Test production build locally**:
   ```bash
   VITE_SUPABASE_URL=xxx VITE_SUPABASE_ANON_KEY=yyy npm run build
   npm run preview
   ```

## 📋 Verification Checklist

- [ ] All VITE_ env vars defined in Coolify build settings
- [ ] Debug code removed from production
- [ ] Dev dependencies conditionally loaded
- [ ] Build completes without errors
- [ ] Preview server shows app, not white screen
- [ ] No console errors about missing env vars
- [ ] Supabase client initializes successfully

## 🎯 Root Cause
The white screen is caused by missing environment variables during the Docker build process in Coolify. Vite requires these variables at BUILD TIME to embed them in the JavaScript bundles. Without them, the Supabase client fails to initialize, causing the app to crash on load.