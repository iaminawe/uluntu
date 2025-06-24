# Coolify Deployment Guide for Nelson Tech Community Platform

This guide covers deploying the Nelson Tech Community Platform using Coolify v4 with Docker Compose.

## 📋 Prerequisites

- Coolify v4 installed and configured
- Domain name pointed to your Coolify server
- SSL certificates (Coolify can handle Let's Encrypt automatically)
- Access to Coolify dashboard

## 🚀 Quick Start Deployment

### 1. Create New Project in Coolify

1. Log into your Coolify dashboard
2. Click "New Project" 
3. Name it: `nelson-tech-community`

### 2. Add New Resource

1. Click "New Resource" in your project
2. Select "Docker Compose"
3. Choose deployment method:
   - **Public Repository** (if open source)
   - **Private Repository** (requires GitHub/GitLab integration)

### 3. Configure Repository

```yaml
Repository URL: https://github.com/yourusername/nelson-tech.git
Branch: main
Docker Compose File: docker-compose.coolify.yml
```

### 4. Environment Variables

Add these environment variables in Coolify's environment section:

```bash
# Frontend URLs
SITE_URL=https://your-domain.com
API_EXTERNAL_URL=https://api.your-domain.com

# Database
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=nelson_tech
POSTGRES_USER=postgres

# Supabase Keys (generate these)
JWT_SECRET=your-jwt-secret-min-32-chars
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Frontend Environment
VITE_SUPABASE_URL=https://api.your-domain.com
VITE_SUPABASE_ANON_KEY=your-anon-key

# Email Configuration (optional)
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-email-password
SMTP_ADMIN_EMAIL=admin@your-domain.com

# Optional Features
ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=false
DISABLE_SIGNUP=false
JWT_EXPIRY=3600
```

### 5. Network Configuration

In Coolify's network settings:

1. **Frontend Service**:
   - Domain: `your-domain.com`
   - Port: 80
   - Enable HTTPS redirect
   - Enable Let's Encrypt SSL

2. **API Gateway (Kong)**:
   - Domain: `api.your-domain.com`
   - Port: 8000
   - Enable HTTPS redirect
   - Enable Let's Encrypt SSL

3. **Supabase Studio** (optional):
   - Domain: `studio.your-domain.com`
   - Port: 3000
   - Enable authentication

## 🔧 Advanced Configuration

### Custom Domain Setup

1. Add A records for:
   - `your-domain.com` → Coolify server IP
   - `api.your-domain.com` → Coolify server IP
   - `studio.your-domain.com` → Coolify server IP (optional)

2. Configure reverse proxy in Coolify:
   ```yaml
   services:
     frontend:
       labels:
         - "traefik.enable=true"
         - "traefik.http.routers.frontend.rule=Host(`your-domain.com`)"
         - "traefik.http.routers.frontend.tls=true"
         - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
   ```

### Database Initialization

The database will be automatically initialized with migrations on first run. To manually run migrations:

```bash
# SSH into Coolify server
docker exec -it nelson-tech-postgres psql -U postgres -d nelson_tech -f /docker-entrypoint-initdb.d/init.sql
```

### Storage Configuration

For production, consider using S3-compatible storage:

```bash
# Additional environment variables for S3
STORAGE_BACKEND=s3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your-bucket-name
```

## 📊 Monitoring & Logs

### View Logs in Coolify

1. Navigate to your deployment
2. Click on any service
3. Select "Logs" tab
4. Use filters:
   - `frontend` - Application logs
   - `postgres` - Database logs
   - `auth` - Authentication logs
   - `storage` - File storage logs

### Health Checks

All services include health checks. Monitor status:

```bash
# Check all services
docker-compose -f docker-compose.coolify.yml ps

# Check specific service health
docker inspect nelson-tech-frontend --format='{{.State.Health.Status}}'
```

## 🔒 Security Considerations

### 1. Secure Environment Variables

- Use Coolify's encrypted environment variables
- Never commit `.env` files to repository
- Rotate JWT secrets regularly

### 2. Database Security

```sql
-- Create read-only user for analytics
CREATE USER analytics_user WITH PASSWORD 'secure-password';
GRANT CONNECT ON DATABASE nelson_tech TO analytics_user;
GRANT USAGE ON SCHEMA public TO analytics_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;
```

### 3. API Rate Limiting

Configure in Kong:

```yaml
plugins:
  - name: rate-limiting
    config:
      minute: 100
      policy: local
```

## 🔄 Deployment Workflow

### Initial Deployment

1. Push code to repository
2. Coolify auto-detects changes
3. Builds and deploys automatically
4. Zero-downtime deployment with health checks

### Updates

```bash
# Automatic deployment on push to main
git push origin main

# Manual deployment in Coolify
# Click "Redeploy" button in dashboard
```

### Rollback

1. Go to Deployments history
2. Find previous successful deployment
3. Click "Rollback to this version"

## 🐛 Troubleshooting

### Common Issues

1. **Frontend not loading**
   ```bash
   # Check nginx logs
   docker logs nelson-tech-frontend
   
   # Verify environment variables
   docker exec nelson-tech-frontend env | grep VITE_
   ```

2. **Database connection issues**
   ```bash
   # Test database connection
   docker exec -it nelson-tech-postgres pg_isready
   
   # Check database logs
   docker logs nelson-tech-postgres
   ```

3. **Storage upload failures**
   ```bash
   # Check storage permissions
   docker exec -it nelson-tech-storage ls -la /var/lib/storage
   
   # Verify storage environment
   docker exec nelson-tech-storage env | grep STORAGE
   ```

### Debug Mode

Enable debug logging:

```yaml
services:
  frontend:
    environment:
      - NODE_ENV=development
      - DEBUG=true
```

## 📈 Performance Optimization

### 1. Enable Caching

```nginx
# In nginx.conf
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 2. Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_companies_featured ON companies(featured);
```

### 3. Enable CDN

Configure Cloudflare or similar:
- Cache static assets
- Enable Brotli compression
- Set up page rules for API endpoints

## 🔗 Useful Links

- [Coolify Documentation](https://coolify.io/docs)
- [Supabase Self-Hosting Guide](https://supabase.com/docs/guides/self-hosting)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Nginx Configuration](https://nginx.org/en/docs/)

## 📞 Support

For deployment issues:
1. Check Coolify logs first
2. Review this guide's troubleshooting section
3. Open an issue in the repository
4. Contact Coolify support for platform-specific issues