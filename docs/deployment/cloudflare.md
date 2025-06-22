# Deploying to Cloudflare Pages

Cloudflare Pages offers exceptional performance with their global edge network and generous free tier.

## 🚀 Quick Deploy

### Option 1: Git Integration (Recommended)

1. **Push your code to GitHub/GitLab**

2. **Create a Pages project:**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to Pages
   - Click "Create a project"
   - Connect to Git

3. **Configure build settings:**
   - **Framework preset:** None
   - **Build command:** `npm run build`
   - **Build output directory:** `/dist`
   - **Root directory:** `/`
   - **Node version:** 18

4. **Set environment variables:**
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_USE_SUPABASE=true
   VITE_APP_URL=https://your-project.pages.dev
   VITE_ENVIRONMENT=production
   ```

5. **Deploy!**

### Option 2: Direct Upload

```bash
# Build your project
npm run build

# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy to Pages
wrangler pages deploy dist --project-name=your-project-name
```

## 📁 Configuration

### _redirects File
The project includes `public/_redirects` for SPA routing:
```
/*    /index.html   200
```

### Headers Configuration
Create `public/_headers` for security headers:
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:;
```

## 🌐 Custom Domain

1. **Add custom domain:**
   - Go to your Pages project → Custom domains
   - Click "Set up a custom domain"
   - Follow DNS instructions

2. **Cloudflare DNS (Recommended):**
   - If your domain uses Cloudflare DNS, it's automatic
   - Orange cloud = Proxied through Cloudflare (recommended)

3. **Update environment:**
   ```
   VITE_APP_URL=https://yourdomain.com
   ```

## 🔄 Deployment Options

### Production Branch
- Set main/master as production branch
- Auto-deploys on push

### Preview Deployments
- Every push creates a preview
- Unique URL for each deployment
- Comments on pull requests

### Manual Deployments
```bash
# Deploy to preview
wrangler pages deploy dist

# Deploy to production
wrangler pages deploy dist --branch=main
```

## 🚀 Advanced Features

### Cloudflare Workers (Functions)
Create `functions/` directory for serverless functions:

```javascript
// functions/api/hello.js
export async function onRequest(context) {
  return new Response(JSON.stringify({ message: "Hello from Cloudflare!" }), {
    headers: { "Content-Type": "application/json" }
  });
}
```

### Edge Caching
Leverage Cloudflare's cache:
```javascript
// functions/_middleware.js
export async function onRequest(context) {
  const response = await context.next();
  
  // Cache static assets
  if (context.request.url.includes('/assets/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  return response;
}
```

### Page Rules
Configure caching and redirects:
- Cache Level: Standard
- Edge Cache TTL: 1 month for assets
- Always Use HTTPS: On

## 📊 Analytics & Monitoring

### Web Analytics
- Free, privacy-first analytics
- No cookies or personal data
- Real-time metrics

### Performance Monitoring
- Core Web Vitals tracking
- Global performance data
- RUM (Real User Monitoring)

## 🛡️ Security Features

### DDoS Protection
- Automatic protection included
- No configuration needed
- Unlimited mitigation

### WAF (Web Application Firewall)
- Basic rules included free
- Custom rules available
- OWASP protection

### SSL/TLS
- Automatic SSL certificates
- Full (strict) encryption mode
- TLS 1.3 support

## 🐛 Troubleshooting

### Build Failures

1. **Check build logs:**
   ```bash
   wrangler pages deployment list
   wrangler pages deployment tail [deployment-id]
   ```

2. **Environment variables:**
   - Set in Pages dashboard
   - Available during build time
   - Prefix with `VITE_` for client access

3. **Node version issues:**
   - Set `NODE_VERSION=18` in environment
   - Or use `.nvmrc` file

### Deployment Issues

```bash
# Check deployment status
wrangler pages deployment list

# View logs
wrangler pages deployment tail

# Rollback if needed
wrangler pages rollback
```

### Large Files
- 25MB file size limit
- Use external storage for larger files
- Consider Cloudflare R2 for assets

## 💰 Pricing

### Free Tier Includes:
- Unlimited bandwidth
- 500 builds/month
- Unlimited requests
- Custom domains
- SSL certificates
- DDoS protection

### Paid Features:
- More concurrent builds
- Build notifications
- Advanced analytics
- Larger file sizes

## 🚄 Performance Tips

1. **Image Optimization:**
   - Use Cloudflare Polish (auto-optimize)
   - Enable WebP conversion
   - Lazy load images

2. **Minification:**
   - Auto-minify HTML/CSS/JS
   - Enable in Cloudflare dashboard

3. **Compression:**
   - Brotli compression enabled by default
   - Gzip fallback for older browsers

## 📚 Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Guide](https://developers.cloudflare.com/workers/wrangler/)
- [Functions Documentation](https://developers.cloudflare.com/pages/platform/functions/)
- [Build Configuration](https://developers.cloudflare.com/pages/platform/build-configuration/)