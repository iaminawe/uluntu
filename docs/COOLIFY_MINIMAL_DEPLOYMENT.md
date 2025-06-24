# Minimal Coolify Deployment Guide

This guide covers deploying the Nelson Tech Community Platform using Coolify with hosted Supabase (single container deployment).

## 🎯 Overview

This minimal deployment:
- Uses **hosted Supabase** (no self-hosted database)
- Runs a **single container** serving the frontend
- Requires minimal configuration
- Perfect for small teams or MVPs

## 📋 Prerequisites

1. **Supabase Account** with a project created
2. **Coolify v4** installed
3. **Domain name** pointed to your Coolify server

## 🚀 Quick Start

### 1. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API
3. Copy:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

### 2. Configure Coolify

1. **Create New Project** in Coolify
2. **Add Resource** → Docker Compose
3. **Configure Repository**:
   ```yaml
   Repository URL: https://github.com/yourusername/nelson-tech.git
   Branch: main
   Docker Compose File: docker-compose.coolify-minimal.yml
   ```

### 3. Environment Variables

Add these in Coolify's environment section:

```bash
# Required - From Supabase Dashboard
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Required - Your Domain
VITE_APP_URL=https://your-domain.com
VITE_ENVIRONMENT=production

# Optional - Email Service
VITE_RESEND_API_KEY=your-resend-key
VITE_FROM_EMAIL=hello@your-domain.com
VITE_FROM_NAME=Nelson Tech Community
```

### 4. Deploy

1. Click **Deploy** in Coolify
2. Wait for build to complete (~2-3 minutes)
3. Your app will be available at your configured domain

## 🔧 Configuration Details

### Database Setup

Since you're using hosted Supabase:
1. Run migrations in Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/*.sql`
3. Execute in order

### Domain Configuration

In Coolify's settings for your app:
- Domain: `your-domain.com`
- Enable HTTPS redirect
- Enable Let's Encrypt SSL

## 📊 Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Browser   │────▶│  Your Container  │────▶│ Hosted Supabase │
└─────────────┘     │  (Frontend Only) │     │   (Database +   │
                    └──────────────────┘     │    Services)    │
                                             └─────────────────┘
```

## 🚨 Important Notes

### Advantages
- ✅ Simple deployment (one container)
- ✅ No database maintenance
- ✅ Automatic Supabase updates
- ✅ Built-in backups
- ✅ Lower resource usage

### Limitations
- ❌ Supabase free tier limits
- ❌ Less control over database
- ❌ Network latency to Supabase
- ❌ Monthly costs for Supabase Pro

## 🔄 Updates & Maintenance

### Updating Your App
```bash
# Push to main branch
git push origin main

# Coolify auto-deploys
# Or manually click "Redeploy"
```

### Monitoring
- Check Coolify logs for app issues
- Monitor Supabase Dashboard for:
  - Database usage
  - API requests
  - Storage usage

## 🐛 Troubleshooting

### App Not Loading
```bash
# Check environment variables
docker exec nelson-tech env | grep VITE_

# Verify Supabase connection
curl https://your-project.supabase.co/rest/v1/
```

### Build Failures
- Ensure Node 20 compatibility
- Check for TypeScript errors
- Verify environment variables

### Supabase Connection Issues
1. Check API keys are correct
2. Verify Row Level Security (RLS) policies
3. Check Supabase service status

## 💰 Cost Considerations

### Coolify Server
- VPS costs (~$5-20/month)
- Domain name (~$12/year)

### Supabase (Free Tier)
- 500MB database
- 1GB storage
- 50K monthly active users
- 2GB bandwidth

### Supabase Pro ($25/month)
- 8GB database
- 100GB storage
- 100K monthly active users
- 50GB bandwidth

## 🔐 Security

1. **Environment Variables**
   - Never commit `.env` files
   - Use Coolify's encrypted variables
   - Rotate API keys regularly

2. **Supabase Security**
   - Enable RLS on all tables
   - Use proper auth policies
   - Enable 2FA on Supabase account

3. **Domain Security**
   - Always use HTTPS
   - Configure security headers
   - Enable Cloudflare (optional)

## 📈 Scaling Options

When you outgrow this setup:

1. **Add CDN** (Cloudflare)
2. **Upgrade Supabase** plan
3. **Add Redis** for caching
4. **Move to full Docker Compose** with self-hosted Supabase
5. **Add load balancer** with multiple containers

## 🔗 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Coolify Docs](https://coolify.io/docs)
- [Main Deployment Guide](./COOLIFY_DEPLOYMENT.md) - For full stack deployment

---

This minimal setup is perfect for getting started quickly with hosted infrastructure while maintaining the flexibility to scale later!