# Deployment Guide

This guide covers deploying the Nelson Tech Community Platform to various hosting providers.

## 🚀 Quick Start

The platform is a single-page application (SPA) built with Vite + React that connects to a hosted Supabase backend. It can be deployed to any static hosting provider.

## 📋 Prerequisites

Before deploying, ensure you have:

1. **Production Supabase instance** configured
2. **Environment variables** ready
3. **Domain name** (optional but recommended)
4. **SSL certificate** (provided automatically by most hosts)

## 🔧 Pre-deployment Steps

1. **Test the production build locally:**
   ```bash
   npm run build
   npm run preview
   ```

2. **Update environment variables for production:**
   - Set `VITE_APP_URL` to your production domain
   - Ensure `VITE_ENVIRONMENT=production`
   - Verify all API keys are production keys

3. **Remove sensitive data:**
   - Ensure `.env` is in `.gitignore`
   - Never commit API keys or secrets

## 🌐 Deployment Options

### [Netlify](./netlify.md) - Recommended for simplicity
- Zero-configuration deployment
- Automatic SSL and CI/CD
- Generous free tier
- Built-in form handling

### [Coolify](./coolify.md) - Best for control
- Self-hosted solution
- Full control over infrastructure
- Supports additional services
- Docker-based deployment

## 📊 Platform Comparison

| Feature | Netlify | Coolify |
|---------|---------|---------|
| **Setup Ease** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Free Tier** | 100GB/month | Self-hosted |
| **Build Minutes** | 300/month | Unlimited |
| **SSL** | Automatic | Manual/Auto |
| **Custom Domain** | ✅ | ✅ |
| **Edge Network** | ✅ | ❌ |
| **Preview Deploys** | ✅ | ✅ |
| **Rollbacks** | ✅ | ✅ |
| **Server Functions** | ✅ | ✅ (Full) |

## 🔐 Security Considerations

1. **Environment Variables:**
   - Never expose service role keys in frontend
   - Use only public anon keys in client code
   - Store sensitive keys in hosting provider's environment settings

2. **Headers Configuration:**
   - All deployment configs include security headers
   - CSP policies are configured for Supabase integration
   - CORS is handled by Supabase

3. **API Security:**
   - Row Level Security (RLS) enabled on all tables
   - Authentication required for protected routes
   - Rate limiting handled by Supabase

## 🚨 Post-deployment Checklist

- [ ] Verify all environment variables are set correctly
- [ ] Test authentication flow (sign up, sign in, sign out)
- [ ] Check that images load from Supabase Storage
- [ ] Verify API calls work (load some data)
- [ ] Test responsive design on mobile devices
- [ ] Check browser console for errors
- [ ] Verify custom domain and SSL certificate
- [ ] Set up monitoring/analytics (optional)

## 📈 Monitoring & Maintenance

1. **Application Monitoring:**
   - Use browser error tracking (e.g., Sentry)
   - Monitor Supabase dashboard for API usage
   - Check hosting provider analytics

2. **Performance Optimization:**
   - Enable caching headers (included in configs)
   - Use CDN for static assets
   - Monitor Core Web Vitals

3. **Regular Updates:**
   - Keep dependencies updated
   - Monitor security advisories
   - Backup Supabase data regularly

## 🆘 Troubleshooting

### Build Failures
- Check Node.js version (requires 18+)
- Clear cache and reinstall dependencies
- Verify all environment variables are set

### API Connection Issues
- Verify Supabase URL and anon key
- Check Supabase project is active
- Ensure RLS policies allow access

### Routing Problems
- Verify SPA redirect rules are configured
- Check that `_redirects` or equivalent is in place
- Test direct URL access to routes

## 📚 Additional Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Security Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html)