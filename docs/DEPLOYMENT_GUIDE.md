# Nelson Tech Community Platform - Deployment Guide

**Last Updated**: November 10, 2025
**Version**: 1.0.0
**Status**: Production Ready

---

## 📋 Pre-Deployment Checklist

### ✅ Phase 1: Security Audit (COMPLETE)
- [x] Remove development authentication bypasses
- [x] Implement DOMPurify sanitization for user content
- [x] Add security headers (CSP, HSTS, X-Frame-Options)
- [x] Remove console.log statements from production code
- [x] Consolidate duplicate Supabase type files
- [x] Create open source governance files (CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md)
- [x] Run npm audit and fix high-severity vulnerabilities

### ✅ Phase 2: Code Quality (COMPLETE)
- [x] Refactor large components (3 files: 1,793 + 1,705 + 1,560 lines → modular)
- [x] Eliminate TypeScript `any` types (31+ removed)
- [x] Add error boundaries to 6 critical features
- [x] Resolve or document 60+ TODO comments
- [x] Verify production build succeeds

### 🚀 Phase 3: Deployment Preparation (CURRENT)
- [ ] Review environment variables
- [ ] Configure production database
- [ ] Set up production Supabase project
- [ ] Configure CDN and static assets
- [ ] Set up monitoring and error tracking
- [ ] Create deployment scripts
- [ ] Test production build locally

---

## 🛠️ Environment Setup

### Required Environment Variables

#### **Frontend (VITE_* variables)**
```bash
# Application
VITE_APP_URL=https://your-domain.com
VITE_ENVIRONMENT=production

# Supabase (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Newsletter (Required for newsletter feature)
VITE_RESEND_API_KEY=your_resend_api_key_here
VITE_FROM_EMAIL=newsletter@your-domain.com
VITE_FROM_NAME=Your Community Name

# AI Features (Optional)
VITE_OPENAI_API_KEY=your-openai-key
VITE_ANTHROPIC_API_KEY=your-anthropic-key
VITE_UNSPLASH_ACCESS_KEY=your-unsplash-key

# Analytics (Optional)
VITE_GOOGLE_ANALYTICS_ID=your-ga-id
VITE_SENTRY_DSN=your-sentry-dsn
```

#### **Backend (Supabase Configuration)**
```bash
# Database
POSTGRES_HOST=your-db-host
POSTGRES_PORT=5432
POSTGRES_DB=your-db-name
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password

# Supabase Auth
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRY=3600

# Email (SMTP)
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-app-password
```

### Feature Flags
```bash
# Enable/disable features
ENABLE_NEWSLETTER=true
ENABLE_GALLERY=true
ENABLE_MARKETPLACE=true
ENABLE_GROUPS=true
ENABLE_EVENTS=true
ENABLE_AI_EDITOR=true
```

---

## 📦 Deployment Options

### Option 1: Netlify (Recommended for Static Sites)

**Setup:**
1. Connect your Git repository to Netlify
2. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 18+

3. Add environment variables in Netlify dashboard
4. Deploy!

**Configuration** (netlify.toml already configured):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

# Security headers and redirects already configured ✅
```

**Custom Domain:**
```bash
# Add custom domain in Netlify dashboard
# Configure DNS:
# CNAME: www.your-domain.com → your-site.netlify.app
# A Record: your-domain.com → Netlify Load Balancer IP
```

---

### Option 2: Vercel

**Setup:**
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project directory
3. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. Add environment variables
5. Deploy: `vercel --prod`

---

### Option 3: Docker + Self-Hosted

**Dockerfile** (create if needed):
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Build and Run:**
```bash
# Build image
docker build -t nelson-tech-platform .

# Run container
docker run -d -p 80:80 \
  -e VITE_SUPABASE_URL=https://your-project.supabase.co \
  -e VITE_SUPABASE_ANON_KEY=your-key \
  nelson-tech-platform
```

---

### Option 4: Coolify (Self-Hosted PaaS)

**Setup:**
1. Create new application in Coolify
2. Connect Git repository
3. Configure build:
   - Build Pack: Nixpacks (Node.js)
   - Build Command: `npm run build`
   - Start Command: `npm run preview` or use nginx
4. Add environment variables
5. Deploy

---

## 🗄️ Database Setup (Supabase)

### 1. Create Supabase Project
```bash
# Sign up at https://supabase.com
# Create new project
# Note: Project URL and anon key
```

### 2. Run Migrations
```bash
# Install Supabase CLI
npm install -g supabase

# Link project
supabase link --project-ref your-project-ref

# Run migrations (if you have migration files)
supabase db push
```

### 3. Configure Storage Buckets
Required storage buckets:
- `profile-images` - Public (2 MB max)
- `content-images` - Public (10 MB max)
- `group-images` - Public (5 MB max)
- `background-images` - Public (5 MB max)
- `gallery-photos` - Public (10 MB max)
- `marketplace-photos` - Public (5 MB max)
- `company-logos` - Public (2 MB max)

**Create via Supabase Dashboard:**
1. Storage → New Bucket
2. Set bucket name
3. Configure: Public/Private, file size limits
4. Set up policies (read: public, write: authenticated)

### 4. Configure Row Level Security (RLS)
- Review RLS policies for all tables
- Ensure proper access control for:
  - Members (profile visibility)
  - Groups (privacy levels)
  - Messages (conversation isolation)
  - Admin functions (role-based)

---

## 🔒 Security Configuration

### Security Headers (Already Configured ✅)
The following headers are configured in `netlify.toml` and `nginx.conf`:

- **X-Frame-Options**: SAMEORIGIN
- **X-Content-Type-Options**: nosniff
- **X-XSS-Protection**: 1; mode=block
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: Restricts camera, microphone, geolocation
- **Strict-Transport-Security**: max-age=31536000; includeSubDomains
- **Content-Security-Policy**: Configured for Supabase, OpenAI, Anthropic

### XSS Protection (Already Implemented ✅)
- DOMPurify sanitization in:
  - Theme customization (custom_head_html, custom_body_html)
  - Page content rendering (rich content, video embeds)
  - User-generated content

### Authentication
- ✅ Development auth bypass REMOVED
- ✅ Secure JWT configuration
- ✅ Role-based access control (RBAC)
- ✅ Supabase Auth with RLS

---

## 📊 Monitoring & Error Tracking

### Sentry Integration (Recommended)
```bash
# Install Sentry
npm install @sentry/react @sentry/vite-plugin

# Add to vite.config.ts
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
  plugins: [
    sentryVitePlugin({
      org: "your-org",
      project: "nelson-tech",
    }),
  ],
});

# Add VITE_SENTRY_DSN to environment variables
```

### Analytics
```bash
# Google Analytics (optional)
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Add tracking code in src/main.tsx (if desired)
```

---

## 🧪 Pre-Deployment Testing

### 1. Local Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Test on http://localhost:4173
```

### 2. Test Checklist
- [ ] Authentication flow (signup, login, logout)
- [ ] Profile creation and editing
- [ ] Image uploads (all storage buckets)
- [ ] Newsletter subscription
- [ ] Group creation and management
- [ ] Messaging system
- [ ] Admin dashboard
- [ ] Error boundaries (test by triggering errors)
- [ ] Mobile responsiveness
- [ ] Dark mode toggle

### 3. Performance Testing
```bash
# Run Lighthouse audit
npm install -g lighthouse

# Test production build
lighthouse http://localhost:4173 --view

# Targets:
# - Performance: >90
# - Accessibility: >95
# - Best Practices: >90
# - SEO: >90
```

---

## 🚀 Deployment Process

### Step-by-Step Deployment

#### 1. Prepare Repository
```bash
# Ensure all changes are committed
git status

# Create production branch (optional)
git checkout -b production
git push origin production
```

#### 2. Configure Hosting Platform
- Add environment variables
- Set build commands
- Configure custom domain
- Enable HTTPS
- Set up automatic deployments

#### 3. Deploy
```bash
# Netlify
git push origin main  # Auto-deploys

# Vercel
vercel --prod

# Docker
docker build -t nelson-tech .
docker push your-registry/nelson-tech:latest
```

#### 4. Post-Deployment Verification
- [ ] Site loads correctly
- [ ] Authentication works
- [ ] Database connections work
- [ ] Image uploads work
- [ ] Newsletter system works
- [ ] No console errors
- [ ] Security headers present (check with https://securityheaders.com/)
- [ ] SSL certificate valid
- [ ] All API endpoints responding

---

## 🔄 Rollback Plan

### If deployment fails:

**Netlify/Vercel:**
1. Go to deployment dashboard
2. Find previous successful deployment
3. Click "Publish" on that deployment

**Docker:**
```bash
# Rollback to previous image
docker pull your-registry/nelson-tech:previous-tag
docker stop nelson-tech
docker run -d --name nelson-tech your-registry/nelson-tech:previous-tag
```

**Database Rollback:**
```bash
# If migrations fail
supabase db reset --db-url your-db-url
# Re-apply working migrations
```

---

## 📞 Post-Deployment

### 1. Monitor Initial Traffic
- Watch error logs (Sentry, CloudWatch, etc.)
- Monitor performance metrics
- Check user feedback

### 2. Set Up Backups
```bash
# Supabase automatic backups (available in dashboard)
# Configure daily backups
# Set retention policy (7-30 days)

# Manual backup
supabase db dump > backup-$(date +%Y%m%d).sql
```

### 3. Set Up Alerts
- Error rate alerts (Sentry)
- Performance degradation alerts
- Database connection issues
- Storage capacity alerts

---

## 📝 Maintenance

### Regular Tasks
- **Weekly**: Review error logs, check performance metrics
- **Monthly**: Review and update dependencies (`npm outdated`)
- **Quarterly**: Security audit (`npm audit`), update Node.js version
- **Annually**: Review and update SSL certificates

### Updates
```bash
# Update dependencies
npm update

# Security updates
npm audit fix

# Major version updates (test thoroughly)
npm outdated
npm install package@latest
```

---

## 🆘 Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Clear cache
rm -rf node_modules dist .vite
npm ci
npm run build
```

**Environment Variable Issues:**
- Ensure all VITE_* variables are prefixed correctly
- Restart development server after .env changes
- Verify variables in hosting platform dashboard

**Database Connection:**
- Check Supabase URL and keys
- Verify RLS policies
- Check network connectivity
- Review Supabase logs

**Image Upload Issues:**
- Verify storage bucket exists
- Check bucket permissions (RLS policies)
- Verify file size limits
- Check CORS configuration

---

## 📚 Additional Resources

- **Supabase Documentation**: https://supabase.com/docs
- **Netlify Documentation**: https://docs.netlify.com
- **Vite Documentation**: https://vitejs.dev
- **React Query Documentation**: https://tanstack.com/query/latest
- **Security Headers Guide**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers

---

## ✅ Deployment Completion Checklist

- [ ] All environment variables configured
- [ ] Supabase project set up and configured
- [ ] Storage buckets created with proper permissions
- [ ] Production build tested locally
- [ ] Security headers verified
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Error tracking configured (Sentry)
- [ ] Analytics configured (Google Analytics)
- [ ] Backups configured
- [ ] Monitoring alerts set up
- [ ] Documentation updated
- [ ] Team notified of deployment

---

**Need Help?**
- Check [GitHub Issues](https://github.com/iaminawe/nelson-tech/issues)
- Review [Security Policy](../SECURITY.md)
- See [Contributing Guidelines](../CONTRIBUTING.md)
