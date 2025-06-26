# Coolify Routing Fix - "No Available Server" Error

## Issue
Your app builds and starts successfully, but shows "no available server" when visiting the domain.

## Common Causes & Solutions

### 1. Check Domain Configuration in Coolify
- Go to your application in Coolify
- Click on "Domains" or "URLs" section
- Verify that `https://nelson-tech.apps.iaminawe.net` is configured
- Ensure "Generate SSL Certificate" is enabled if using HTTPS

### 2. Check Container Port Mapping
Your app is running on port 80 inside the container. Verify in Coolify:
- Application Settings → Port = 80
- Or check if it's expecting port 3000 (some configs use this)

### 3. Health Check Issues
The container might be failing health checks. Check:
- Application logs in Coolify
- Container status: Is it marked as "healthy"?

### 4. Verify Container is Running
SSH into your Coolify server and check:
```bash
# List running containers
docker ps | grep l8owcko8g4wcwccwogo0kkcg

# Check container logs
docker logs app-l8owcko8g4wcwccwogo0kkcg-201337555276 --tail 50

# Test the app directly
docker exec app-l8owcko8g4wcwccwogo0kkcg-201337555276 curl -I http://localhost:80
```

### 5. Proxy/Traefik Configuration
Coolify uses Traefik as a reverse proxy. Check:
- Coolify → Settings → Proxy is running
- Check Traefik labels on your container:
```bash
docker inspect app-l8owcko8g4wcwccwogo0kkcg-201337555276 | grep -A 20 Labels
```

### 6. Quick Fixes to Try

#### Fix 1: Update Application Port
In Coolify application settings:
- Set "Port" to 80 (matching nginx in your container)
- Save and wait for routing to update

#### Fix 2: Force Proxy Reload
```bash
# On Coolify server
docker restart coolify-proxy
```

#### Fix 3: Check DNS
Verify the domain points to your Coolify server:
```bash
nslookup nelson-tech.apps.iaminawe.net
ping nelson-tech.apps.iaminawe.net
```

### 7. Container-Specific Checks
Since your container ID is `app-l8owcko8g4wcwccwogo0kkcg-201337555276`:

```bash
# Check if nginx is running inside
docker exec app-l8owcko8g4wcwccwogo0kkcg-201337555276 ps aux | grep nginx

# Check nginx config
docker exec app-l8owcko8g4wcwccwogo0kkcg-201337555276 nginx -t

# Check if the app files are there
docker exec app-l8owcko8g4wcwccwogo0kkcg-201337555276 ls -la /usr/share/nginx/html
```

### 8. Manual Test
Test if the app works directly (bypassing proxy):
```bash
# Get container IP
docker inspect app-l8owcko8g4wcwccwogo0kkcg-201337555276 | grep IPAddress

# Test directly (replace with actual IP)
curl -I http://[CONTAINER_IP]:80
```

## Most Likely Solution
Based on your setup, the most common fix is:
1. Go to Coolify → Your Application → Settings
2. Set "Port" to `80` (not 3000)
3. Ensure domain is set to `https://nelson-tech.apps.iaminawe.net`
4. Click "Save"
5. Wait 30-60 seconds for proxy to reconfigure

The issue is usually that Coolify's proxy isn't correctly routing traffic to your container's port 80.