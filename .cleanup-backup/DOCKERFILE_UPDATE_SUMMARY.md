# Dockerfile Update Summary

## Changes Made

All Docker Compose files have been updated to use `Dockerfile.production` instead of `Dockerfile` or `Dockerfile.minimal`:

### Files Updated:
1. ✅ `docker-compose.yml` - Changed from `Dockerfile` to `Dockerfile.production`
2. ✅ `docker-compose.coolify.yml` - Changed from `Dockerfile` to `Dockerfile.production`
3. ✅ `docker-compose.coolify-minimal.yml` - Changed from `Dockerfile.minimal` to `Dockerfile.production`

### Why This Change Is Critical:

1. **Consistency** - All deployment configurations now use the same Dockerfile
2. **Complete Environment Variable Support** - `Dockerfile.production` properly handles ALL required Vite environment variables:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - VITE_APP_URL
   - VITE_ENVIRONMENT
   - Plus all optional variables (email, analytics, feature flags, etc.)

3. **Build Verification** - `Dockerfile.production` includes verification that checks if environment variables were properly embedded:
   ```
   ✅ Build verification passed - Supabase URL found in built files
   ```

4. **Production-Ready** - Uses nginx for serving static files (more efficient than Node.js serve)

### Next Steps:

1. **Commit these changes**:
   ```bash
   git add docker-compose*.yml
   git commit -m "fix: use Dockerfile.production for all compose files"
   git push
   ```

2. **In Coolify**, ensure you have all required Build Variables set:
   ```
   VITE_SUPABASE_URL=https://opkqtpmmtvprhfyjmkhx.supabase.co
   VITE_SUPABASE_ANON_KEY=[your-anon-key]
   VITE_APP_URL=https://nelson-tech.apps.iaminawe.net
   VITE_ENVIRONMENT=production
   VITE_USE_SUPABASE=true
   ```

3. **Trigger a new deployment** in Coolify

4. **Watch the build logs** for the verification message

This should resolve the white screen issue on your Coolify deployment!