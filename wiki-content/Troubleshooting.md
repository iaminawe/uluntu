# Troubleshooting Guide

Common issues and their solutions for the Nelson Tech Community Platform.

---

## Table of Contents

- [Installation Issues](#installation-issues)
- [Build Errors](#build-errors)
- [Database Issues](#database-issues)
- [Development Server Problems](#development-server-problems)
- [TypeScript Errors](#typescript-errors)
- [Testing Issues](#testing-issues)
- [Deployment Problems](#deployment-problems)
- [Performance Issues](#performance-issues)

---

## Installation Issues

### `npm install` Fails

**Problem**: Package installation errors

**Solutions**:

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

If still failing:
```bash
# Try with legacy peer deps
npm install --legacy-peer-deps
```

### Node Version Mismatch

**Problem**: `Error: Requires Node.js 18+`

**Solution**:
```bash
# Check your Node version
node --version

# If < 18, install Node 18+
# Using nvm (recommended):
nvm install 18
nvm use 18

# Verify
node --version
```

### Permission Errors

**Problem**: `EACCES: permission denied`

**Solution**:
```bash
# Don't use sudo! Fix npm permissions:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'

# Add to your PATH in ~/.bashrc or ~/.zshrc:
export PATH=~/.npm-global/bin:$PATH

# Reload shell
source ~/.bashrc  # or source ~/.zshrc
```

---

## Build Errors

### Build Fails with TypeScript Errors

**Problem**: `npm run build` fails with type errors

**Solutions**:

1. **Check for any type**:
```bash
# Run type checking
npm run typecheck
```

2. **Clear TypeScript cache**:
```bash
# Remove TypeScript build cache
rm -rf node_modules/.cache
npm run build
```

3. **Update TypeScript**:
```bash
npm update typescript
```

### Vite Build Fails

**Problem**: `failed to load config from vite.config.ts`

**Solutions**:

```bash
# Ensure vite.config.ts is valid
npm run typecheck

# Clear Vite cache
rm -rf node_modules/.vite
npm run build
```

### Out of Memory Errors

**Problem**: `JavaScript heap out of memory`

**Solution**:
```bash
# Increase Node memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

Or add to `package.json` scripts:
```json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' vite build"
  }
}
```

---

## Database Issues

### Cannot Connect to Supabase

**Problem**: `Error: Failed to connect to database`

**Checklist**:

1. **Verify `.env` file**:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-key-here
VITE_USE_SUPABASE=true
```

2. **Check Supabase project status**:
- Go to [Supabase Dashboard](https://supabase.com/dashboard)
- Ensure project is active (not paused)
- Verify API keys match

3. **Test connection**:
```bash
# Test in browser console
console.log(import.meta.env.VITE_SUPABASE_URL)
```

### Migration Errors

**Problem**: `Migration failed` or `RLS policy error`

**Solutions**:

```bash
# Reset database (⚠️ DELETES ALL DATA)
supabase db reset

# Or apply migrations manually
supabase db push

# Check migration status
supabase migration list
```

### RLS Policy Errors

**Problem**: `new row violates row-level security policy`

**Solutions**:

1. **Check RLS policies in Supabase Dashboard**:
   - Go to Authentication → Policies
   - Ensure policies are enabled
   - Verify user has correct role

2. **Common fix for first user**:
```sql
-- Run in Supabase SQL Editor
-- Make first user a superadmin
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"system_role": "superadmin"}'::jsonb
WHERE email = 'your-email@example.com';
```

### Database Connection Pool Exhausted

**Problem**: `remaining connection slots are reserved`

**Solution**:
```bash
# Restart Supabase (if self-hosted)
supabase stop
supabase start

# Or upgrade Supabase plan (if using cloud)
```

---

## Development Server Problems

### Port 5555 Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::5555`

**Solutions**:

```bash
# Kill process on port 5555
npx kill-port 5555

# Or use different port
npm run dev -- --port 3000
```

On Linux/Mac:
```bash
lsof -ti:5555 | xargs kill -9
```

### Hot Reload Not Working

**Problem**: Changes not reflecting in browser

**Solutions**:

1. **Clear browser cache**: Ctrl+Shift+R (or Cmd+Shift+R)

2. **Restart dev server**:
```bash
# Stop server (Ctrl+C)
# Clear Vite cache
rm -rf node_modules/.vite
# Restart
npm run dev
```

3. **Check file watchers limit** (Linux):
```bash
# Increase watchers
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### CORS Errors

**Problem**: `Cross-Origin Request Blocked`

**Solutions**:

1. **In Supabase Dashboard**:
   - Settings → API
   - Add `http://localhost:5555` to CORS origins

2. **Check Vite proxy** (if using):
```ts
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
```

---

## TypeScript Errors

### `any` Type Errors

**Problem**: `Type 'any' is not assignable`

**Solution**:

Define proper types:
```typescript
// ❌ Bad
const data: any = await fetchData();

// ✅ Good
interface DataType {
  id: string;
  name: string;
}
const data: DataType = await fetchData();
```

### Module Not Found

**Problem**: `Cannot find module '@/components/...'`

**Solutions**:

1. **Check `tsconfig.json` paths**:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

2. **Restart TypeScript server** in VS Code:
   - Cmd/Ctrl + Shift + P
   - "TypeScript: Restart TS Server"

### Type Definition Errors

**Problem**: `Could not find a declaration file for module`

**Solution**:
```bash
# Install type definitions
npm install --save-dev @types/react @types/node

# Or create ambient declaration
# Create src/types/modules.d.ts:
declare module 'some-module';
```

---

## Testing Issues

### Tests Failing

**Problem**: Tests that previously passed now fail

**Solutions**:

```bash
# Clear Jest cache
npm test -- --clearCache

# Update snapshots
npm test -- --updateSnapshot

# Run specific test
npm test -- path/to/test.test.tsx
```

### Mock Errors

**Problem**: `Cannot find module 'xxx' from 'xxx.test.tsx'`

**Solution**:

Check jest.config.js moduleNameMapper:
```javascript
module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

### Timeout Errors

**Problem**: `Timeout - Async callback was not invoked within the 5000ms timeout`

**Solution**:
```typescript
// Increase timeout for specific test
test('slow test', async () => {
  // test code
}, 10000); // 10 second timeout
```

---

## Deployment Problems

### Build Succeeds Locally but Fails in CI/CD

**Problem**: GitHub Actions build fails

**Solutions**:

1. **Check Node version** in `.github/workflows/*.yml`:
```yaml
- uses: actions/setup-node@v3
  with:
    node-version: '18'  # Match local version
```

2. **Environment variables**:
   - Add secrets in GitHub repo settings
   - Ensure all VITE_* variables are set

3. **Memory issues**:
```yaml
- name: Build
  run: NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Netlify Build Fails

**Problem**: Deployment fails on Netlify

**Solutions**:

1. **Check build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

2. **Add environment variables** in Netlify:
   - Site settings → Build & deploy → Environment
   - Add all `VITE_*` variables

3. **Build plugin** (if needed):
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### White Screen After Deployment

**Problem**: App shows blank page in production

**Solutions**:

1. **Check browser console** for errors

2. **Verify base URL** in `vite.config.ts`:
```ts
export default defineConfig({
  base: '/', // or '/your-repo-name/' for GitHub Pages
})
```

3. **Check routing**:
   - Ensure `_redirects` file exists (Netlify)
   - Or configure rewrites for SPA

4. **Environment variables**:
   - Verify all VITE_* vars are set
   - Check Supabase URL is production URL

---

## Performance Issues

### Slow Build Times

**Problem**: Build takes > 2 minutes

**Solutions**:

```bash
# Disable source maps in production
# vite.config.ts
export default defineConfig({
  build: {
    sourcemap: false
  }
})

# Use parallel builds
npm run build -- --parallel
```

### Large Bundle Size

**Problem**: Bundle > 1MB

**Solutions**:

1. **Analyze bundle**:
```bash
npm run build -- --report
```

2. **Lazy load routes**:
```typescript
const AdminPage = lazy(() => import('./pages/AdminPage'));
```

3. **Code splitting**:
```typescript
import(/* webpackChunkName: "admin" */ './AdminPanel')
```

### Slow Development Server

**Problem**: HMR takes > 5 seconds

**Solutions**:

1. **Optimize dependencies**:
```ts
// vite.config.ts
export default defineConfig({
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})
```

2. **Reduce watchers**:
```ts
export default defineConfig({
  server: {
    watch: {
      ignored: ['**/node_modules/**', '**/.git/**']
    }
  }
})
```

---

## Common Error Messages

### `Module not found: Error: Can't resolve...`

**Cause**: Import path is incorrect

**Fix**:
- Check file exists at specified path
- Verify case sensitivity (imports are case-sensitive)
- Check tsconfig.json paths configuration

### `Unexpected token '<'`

**Cause**: Trying to import HTML as JavaScript

**Fix**:
- Check import path
- Ensure you're importing the correct file
- Verify build output

### `Failed to fetch dynamically imported module`

**Cause**: Chunk loading error (often after redeployment)

**Fix**:
- Clear browser cache
- Ensure base URL is correct
- Check CDN/hosting configuration

---

## Getting More Help

### Enable Debug Mode

```bash
# Development
DEBUG=* npm run dev

# Or specific namespace
DEBUG=vite:* npm run dev
```

### Check Logs

```bash
# Browser console logs
# Network tab (check failed requests)
# Supabase logs (in dashboard)
```

### Gather Information

When reporting issues, include:
1. Error message (full stack trace)
2. Steps to reproduce
3. Environment (OS, Node version, browser)
4. Relevant code snippets
5. What you've tried

### Resources

- **[FAQ](FAQ)** - Common questions
- **[Development Tips](Development-Tips)** - Helpful tricks
- **[Full Documentation](https://iaminawe.github.io/nelson-tech/)** - Technical docs
- **GitHub Issues** - Search existing issues or create new
- **GitHub Discussions** - Ask the community

---

## Still Stuck?

1. Search [GitHub Issues](https://github.com/iaminawe/nelson-tech/issues)
2. Check [GitHub Discussions](https://github.com/iaminawe/nelson-tech/discussions)
3. Create a new issue with full details
4. Join community chat (Slack/Discord - coming soon)

---

**Previous**: [FAQ](FAQ) | **Next**: [Development Tips](Development-Tips)
