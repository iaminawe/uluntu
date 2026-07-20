# Production Deployment Checklist

Complete checklist for deploying the Nelson Tech Community Platform to production.

---

## Pre-Deployment

### Code Quality

- [ ] All tests pass (`npm test`)
- [ ] TypeScript compiles without errors (`npm run typecheck`)
- [ ] Linting passes (`npm run lint`)
- [ ] Production build succeeds (`npm run build`)
- [ ] No console errors in build output
- [ ] Code review completed
- [ ] Security audit passed

### Documentation

- [ ] README is up to date
- [ ] CHANGELOG updated with new version
- [ ] API documentation current
- [ ] Deployment guide reviewed
- [ ] Environment variables documented

### Dependencies

- [ ] All dependencies up to date
- [ ] No known security vulnerabilities (`npm audit`)
- [ ] package-lock.json committed
- [ ] No unused dependencies
- [ ] License compatibility checked

---

## Environment Setup

### Supabase Configuration

- [ ] Production Supabase project created
- [ ] Database migrations applied
- [ ] Row Level Security (RLS) policies enabled
- [ ] Storage buckets configured
- [ ] CORS settings configured
- [ ] Email templates customized
- [ ] Authentication providers configured
- [ ] Database backups enabled

### Environment Variables

Required variables in production:

- [ ] `VITE_SUPABASE_URL` set
- [ ] `VITE_SUPABASE_ANON_KEY` set
- [ ] `VITE_USE_SUPABASE=true`
- [ ] Optional: `VITE_OPENAI_API_KEY` (if using AI features)
- [ ] Optional: `VITE_GA_ID` (Google Analytics)
- [ ] Optional: `VITE_SENTRY_DSN` (error tracking)

### Security Configuration

- [ ] Security headers configured
  - Content Security Policy (CSP)
  - HSTS
  - X-Frame-Options
  - X-Content-Type-Options
- [ ] HTTPS enabled
- [ ] SSL certificate valid
- [ ] Rate limiting configured
- [ ] DOMPurify sanitization enabled
- [ ] Authentication tokens secure
- [ ] Admin endpoints protected

---

## Platform-Specific Setup

### Netlify

- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Node version: `18`
- [ ] Environment variables added
- [ ] Custom domain configured
- [ ] SSL certificate enabled
- [ ] Redirects configured (`_redirects` file)
- [ ] Functions configured (if applicable)

### Vercel

- [ ] Framework preset: Vite
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Node version: `18`
- [ ] Environment variables added
- [ ] Custom domain configured
- [ ] SSL certificate enabled
- [ ] Rewrites configured

### Docker

- [ ] Dockerfile optimized
- [ ] Multi-stage build used
- [ ] `.dockerignore` configured
- [ ] Image size optimized
- [ ] Health check implemented
- [ ] Environment variables passed
- [ ] Volumes configured
- [ ] Container orchestration ready

### Coolify / Self-Hosted

- [ ] Server requirements met
- [ ] Docker installed
- [ ] Domain configured
- [ ] SSL certificate setup
- [ ] Reverse proxy configured
- [ ] Environment variables set
- [ ] Monitoring setup
- [ ] Backup strategy implemented

---

## Database Deployment

### Migrations

- [ ] All migrations tested locally
- [ ] Migration order verified
- [ ] Rollback plan prepared
- [ ] Data migration scripts ready
- [ ] Seed data prepared (if applicable)

### Run Migrations

```bash
# Backup database first!
# Then apply migrations:
supabase db push

# Or manually in production:
supabase migration up
```

### Verification

- [ ] All tables created
- [ ] Indexes applied
- [ ] RLS policies active
- [ ] Functions deployed
- [ ] Triggers working
- [ ] Foreign keys validated
- [ ] Sample queries working

---

## Build & Deploy

### Build Production Bundle

```bash
# Create optimized build
npm run build

# Test production build locally
npm run preview

# Verify build output
ls -lh dist/
```

### Pre-Deploy Checks

- [ ] Build size acceptable (< 2MB initial)
- [ ] No source maps in production
- [ ] Environment variables confirmed
- [ ] API endpoints correct
- [ ] Asset URLs correct
- [ ] PWA manifest included (if applicable)

### Deploy Steps

**Option A: Automated (Recommended)**
```bash
# Netlify
netlify deploy --prod

# Vercel
vercel deploy --prod

# GitHub Actions
# Push to main branch (auto-deploys)
```

**Option B: Manual**
```bash
# Build
npm run build

# Upload dist/ folder to hosting
# Configure server/CDN
```

---

## Post-Deployment

### Immediate Verification

- [ ] Site loads without errors
- [ ] Homepage renders correctly
- [ ] Authentication works
- [ ] Database connection active
- [ ] API calls successful
- [ ] Images/assets loading
- [ ] Dark mode toggle works
- [ ] Mobile responsive

### Functional Testing

**Authentication Flow**
- [ ] Sign up works
- [ ] Email verification received
- [ ] Login successful
- [ ] Password reset works
- [ ] Logout works

**Core Features**
- [ ] Create group
- [ ] Upload to gallery
- [ ] Send message
- [ ] Create event
- [ ] Post to marketplace
- [ ] Submit opportunity

**Admin Functions**
- [ ] Admin dashboard accessible
- [ ] User management works
- [ ] Content moderation tools
- [ ] Settings management
- [ ] Theme customization

### Performance Testing

- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Core Web Vitals pass
- [ ] Page load time < 2s
- [ ] API response time < 500ms

### Security Testing

- [ ] HTTPS working
- [ ] Security headers present
- [ ] XSS protection active
- [ ] CSRF protection enabled
- [ ] SQL injection prevented
- [ ] File upload restrictions
- [ ] Rate limiting working

---

## Monitoring Setup

### Error Tracking

**Sentry** (Recommended)
```typescript
// Add to main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: "production",
});
```

- [ ] Sentry configured
- [ ] Error alerts set up
- [ ] Performance monitoring enabled
- [ ] Release tracking configured

### Analytics

**Google Analytics**
```typescript
// Add to index.html or use plugin
gtag('config', 'GA_MEASUREMENT_ID');
```

- [ ] Analytics tracking installed
- [ ] Goals configured
- [ ] Events tracking
- [ ] User flows monitored

### Application Monitoring

- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Performance monitoring (Lighthouse CI)
- [ ] Database performance tracking
- [ ] API response time monitoring
- [ ] Error rate alerts
- [ ] Resource usage tracking

---

## Backup & Recovery

### Database Backups

- [ ] Automated daily backups enabled
- [ ] Backup retention policy set (30 days recommended)
- [ ] Backup restoration tested
- [ ] Point-in-time recovery configured
- [ ] Backup storage secure

### Code Backups

- [ ] GitHub repository backed up
- [ ] Git tags for releases
- [ ] Docker images tagged
- [ ] Environment configs backed up

### Recovery Plan

- [ ] Rollback procedure documented
- [ ] Database restore procedure tested
- [ ] Downtime communication plan
- [ ] Emergency contacts list

---

## DNS & Domain

### Domain Configuration

- [ ] Domain purchased/renewed
- [ ] DNS records configured
  - A record for root domain
  - CNAME for www
  - MX records for email
- [ ] SSL certificate issued
- [ ] SSL auto-renewal enabled
- [ ] CDN configured (if applicable)

### Verification

```bash
# Check DNS propagation
dig yourdomain.com

# Test SSL
curl -I https://yourdomain.com
```

---

## Documentation Updates

### Public Documentation

- [ ] Update README with production URL
- [ ] Update CHANGELOG
- [ ] Publish release notes
- [ ] Update API documentation
- [ ] Update screenshots/demos

### Internal Documentation

- [ ] Deployment runbook updated
- [ ] Rollback procedures documented
- [ ] Monitoring dashboards linked
- [ ] Support procedures updated
- [ ] Team access documented

---

## Team Notification

### Inform Stakeholders

- [ ] Team notified of deployment
- [ ] Users notified of new features
- [ ] Known issues communicated
- [ ] Support team briefed
- [ ] Documentation links shared

### Post-Deployment Meeting

- [ ] Review deployment process
- [ ] Discuss any issues
- [ ] Plan next release
- [ ] Update procedures

---

## Ongoing Maintenance

### Daily Checks

- [ ] Error rate < 1%
- [ ] Uptime > 99.9%
- [ ] Performance baseline maintained
- [ ] No critical alerts

### Weekly Tasks

- [ ] Review error logs
- [ ] Check database growth
- [ ] Monitor storage usage
- [ ] Review analytics
- [ ] Update dependencies

### Monthly Tasks

- [ ] Security audit
- [ ] Performance review
- [ ] Backup restoration test
- [ ] Disaster recovery drill
- [ ] Cost optimization review

---

## Rollback Procedure

### If Deployment Fails

1. **Immediate Actions**
```bash
# Revert to previous deployment
git revert HEAD
git push origin main

# Or use platform rollback
netlify rollback
# or
vercel rollback
```

2. **Database Rollback** (if needed)
```bash
# Restore from backup
supabase db restore <backup-id>
```

3. **Communicate**
   - Notify team
   - Update status page
   - Inform affected users

4. **Post-Mortem**
   - Document what went wrong
   - Update deployment checklist
   - Prevent future occurrences

---

## Success Criteria

Deployment is successful when:

- ✅ All tests pass
- ✅ Site loads without errors
- ✅ Core features work
- ✅ Performance meets targets
- ✅ Security checks pass
- ✅ Monitoring active
- ✅ Team notified
- ✅ Documentation updated

---

## Resources

- **[Deployment Guide](https://iaminawe.github.io/nelson-tech/DEPLOYMENT_GUIDE/)** - Full guide
- **[Troubleshooting](Troubleshooting)** - Common issues
- **[FAQ](FAQ)** - Questions
- **[Security Policy](../SECURITY.md)** - Security guidelines

---

**🎉 Ready to deploy? Let's go!**

---

**Previous**: [Development Tips](Development-Tips) | **Next**: [Home](Home)
