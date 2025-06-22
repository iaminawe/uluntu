# Deploying to Netlify

Netlify offers the easiest deployment experience with automatic builds, previews, and rollbacks.

## 🚀 Quick Deploy

### Option 1: Git-based Deployment (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Import to Netlify:**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git provider
   - Select your repository

3. **Configure build settings:**
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** Set to 18 in environment variables

4. **Add environment variables:**
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_USE_SUPABASE=true
   VITE_APP_URL=https://yourdomain.netlify.app
   VITE_ENVIRONMENT=production
   NODE_VERSION=18
   ```

5. **Deploy!**

### Option 2: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

## 📁 Configuration File

The project includes a `netlify.toml` file with optimal settings:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
```

## 🌐 Custom Domain

1. **Add domain in Netlify:**
   - Go to Site settings → Domain management
   - Click "Add custom domain"
   - Follow DNS configuration instructions

2. **Update environment variable:**
   ```
   VITE_APP_URL=https://yourdomain.com
   ```

## 🔄 Continuous Deployment

### Branch Deploys
- Main branch: Auto-deploys to production
- Feature branches: Create preview deployments
- Pull requests: Automatic deploy previews with comments

### Deploy Hooks
Create webhooks to trigger deployments:
```bash
curl -X POST -d {} https://api.netlify.com/build_hooks/YOUR_HOOK_ID
```

## 🚀 Advanced Features

### Netlify Functions (Optional)
If you need server-side functionality:

1. Create `netlify/functions/` directory
2. Add serverless functions:
```javascript
// netlify/functions/hello.js
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from Netlify Functions!" })
  };
};
```

### Form Handling
Netlify can process forms without server code:
```html
<form name="contact" method="POST" data-netlify="true">
  <input type="hidden" name="form-name" value="contact" />
  <!-- form fields -->
</form>
```

### Split Testing
Enable A/B testing:
```toml
[[plugins]]
  package = "@netlify/plugin-split-testing"
```

## 📊 Monitoring

### Analytics
- Enable Analytics in Site settings
- View real-time visitor data
- Monitor performance metrics

### Deploy Notifications
Set up notifications for:
- Successful deploys
- Failed builds
- Deploy previews

## 🐛 Troubleshooting

### Build Failures

1. **Check build logs:**
   - View detailed logs in Netlify dashboard
   - Look for missing dependencies or environment variables

2. **Clear cache and retry:**
   - Go to Deploys → Trigger deploy → Clear cache and deploy site

3. **Local testing:**
   ```bash
   # Test build locally
   npm run build
   
   # Test with Netlify CLI
   netlify build
   ```

### Environment Variables
- Variables are available during build time
- Prefix with `VITE_` for Vite to expose them
- Rebuild after changing variables

### Large Files
- Use Git LFS for files > 100MB
- Consider Netlify Large Media for images

## 🔒 Security

### Headers
Security headers are configured in `netlify.toml`:
- X-Frame-Options prevents clickjacking
- CSP headers control resource loading
- HSTS enforces HTTPS (auto-enabled)

### Access Control
Password protect sites:
```toml
# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    Basic-Auth = "user:password"
```

## 💰 Pricing

### Free Tier Includes:
- 100GB bandwidth/month
- 300 build minutes/month
- Automatic SSL
- Continuous deployment
- Deploy previews

### Pro Features:
- Background functions
- Analytics
- Form submissions (1000/month)
- Identity/authentication
- Large Media

## 📚 Resources

- [Netlify Documentation](https://docs.netlify.com)
- [Deploy Previews Guide](https://docs.netlify.com/site-deploys/deploy-previews/)
- [Environment Variables](https://docs.netlify.com/configure-builds/environment-variables/)
- [Netlify CLI](https://docs.netlify.com/cli/get-started/)