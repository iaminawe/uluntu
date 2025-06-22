# Deploying to Coolify

Coolify is an open-source, self-hostable platform that gives you complete control over your deployment infrastructure.

## 🚀 Prerequisites

### Server Requirements
- VPS or dedicated server (minimum 2GB RAM)
- Ubuntu 20.04+ or Debian 11+
- Docker installed
- Domain name with DNS access

### Coolify Installation
```bash
# Quick install on your server
curl -fsSL https://get.coolify.io | bash
```

## 📦 Deployment Methods

### Option 1: Docker Deployment (Recommended)

The project includes a `Dockerfile` optimized for production:

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Option 2: Static Deployment

1. **Build locally:**
   ```bash
   npm run build
   ```

2. **Deploy dist folder:**
   - Use Coolify's static site deployment
   - Upload the `dist` directory

## 🔧 Coolify Configuration

### 1. Create New Project

1. **Access Coolify dashboard**
2. **Click "New Project"**
3. **Select deployment type:**
   - Docker (using Dockerfile)
   - Static site
   - Node.js application

### 2. Git Repository Setup

```yaml
# For GitHub integration
Source: GitHub
Repository: your-username/your-repo
Branch: main
```

### 3. Environment Variables

Add these in Coolify's environment section:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_USE_SUPABASE=true
VITE_APP_URL=https://yourdomain.com
VITE_ENVIRONMENT=production
```

### 4. Build Configuration

For Docker deployment:
```yaml
Type: Dockerfile
Dockerfile Path: ./Dockerfile
Build Args: (none needed)
Port: 80
```

For Static deployment:
```yaml
Build Command: npm run build
Install Command: npm ci
Output Directory: dist
```

## 🐳 Docker Compose Alternative

Create `docker-compose.yml` for local testing:

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## 🌐 Domain & SSL Configuration

### Automatic SSL with Coolify
1. **Add domain in Coolify settings**
2. **Enable "Force HTTPS"**
3. **Coolify handles Let's Encrypt automatically**

### Manual Nginx Configuration
If customizing nginx further:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # ... rest of config from nginx.conf
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions Integration

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Coolify

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Coolify
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.COOLIFY_TOKEN }}" \
            -H "Content-Type: application/json" \
            https://your-coolify-instance.com/api/v1/deploy/your-app-id
```

### Webhook Deployment
1. **Get webhook URL from Coolify**
2. **Add to GitHub repository webhooks**
3. **Auto-deploy on push**

## 📊 Monitoring & Logs

### Application Logs
```bash
# View logs in Coolify dashboard
# Or SSH to server:
docker logs container-name

# Follow logs
docker logs -f container-name
```

### Resource Monitoring
- CPU and memory usage in Coolify dashboard
- Set up alerts for high usage
- Configure auto-scaling if needed

### Health Checks
```nginx
location /health {
    access_log off;
    return 200 "OK";
    add_header Content-Type text/plain;
}
```

## 🔧 Advanced Configuration

### Multi-Stage Deployment

```yaml
# coolify.yml
stages:
  - name: staging
    domain: staging.yourdomain.com
    branch: develop
    
  - name: production
    domain: yourdomain.com
    branch: main
```

### Database Backup
If running databases on same server:

```bash
# Backup script
#!/bin/bash
pg_dump -h localhost -U postgres yourdb > backup-$(date +%Y%m%d).sql
```

### Redis Cache (Optional)
Add Redis for session management:

```yaml
services:
  redis:
    image: redis:alpine
    restart: unless-stopped
    volumes:
      - redis-data:/data
```

## 🐛 Troubleshooting

### Build Failures

1. **Check Coolify logs:**
   - Build logs in dashboard
   - Application logs
   - System logs

2. **SSH debugging:**
   ```bash
   # Check Docker status
   docker ps
   docker logs [container-id]
   
   # Check disk space
   df -h
   
   # Check memory
   free -m
   ```

### Permission Issues
```bash
# Fix file permissions
chmod -R 755 /app
chown -R www-data:www-data /app
```

### Network Issues
```bash
# Check ports
netstat -tlnp
lsof -i :80

# Test connectivity
curl http://localhost
```

## 💰 Cost Optimization

### Server Recommendations
- **Small**: 2GB RAM, 1 CPU ($5-10/month)
- **Medium**: 4GB RAM, 2 CPU ($20-40/month)
- **Large**: 8GB RAM, 4 CPU ($40-80/month)

### Resource Optimization
1. **Enable gzip compression**
2. **Use CDN for static assets**
3. **Implement caching strategies**
4. **Monitor and scale as needed**

## 🔒 Security Hardening

### Server Security
```bash
# Basic firewall setup
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Fail2ban for SSH protection
apt install fail2ban
```

### Application Security
- Keep Coolify updated
- Regular security patches
- Use strong passwords
- Enable 2FA where possible

## 📚 Resources

- [Coolify Documentation](https://coolify.io/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Nginx Optimization](https://www.nginx.com/blog/tuning-nginx/)
- [Let's Encrypt Guide](https://letsencrypt.org/getting-started/)