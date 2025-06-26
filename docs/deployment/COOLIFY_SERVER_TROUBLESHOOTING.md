# Coolify "No Available Server" Troubleshooting

## Quick Checks

### 1. Check Server Status in Coolify
- Go to Coolify Dashboard → Servers
- Verify your server is listed and shows as "Connected"
- Check the server health status

### 2. SSH into Your Coolify Server
```bash
ssh root@your-coolify-server-ip
```

### 3. Check Docker Status
```bash
# Check if Docker is running
sudo systemctl status docker

# If not running, start it
sudo systemctl start docker

# Check Docker version
docker --version

# Test Docker
docker run hello-world
```

### 4. Check Coolify Services
```bash
# Check Coolify containers
docker ps | grep coolify

# Check Coolify logs
docker logs coolify

# Restart Coolify if needed
docker restart coolify
```

### 5. Check Server Resources
```bash
# Check disk space
df -h

# Check memory
free -h

# Check CPU load
top
```

## Common Fixes

### Fix 1: Restart Docker
```bash
sudo systemctl restart docker
```

### Fix 2: Clean Up Docker Resources
```bash
# Remove unused containers, networks, images
docker system prune -a

# Remove unused volumes
docker volume prune
```

### Fix 3: Re-register Server in Coolify
1. Go to Coolify → Servers
2. Remove the problematic server
3. Add it back with the correct SSH credentials
4. Test the connection

### Fix 4: Check Coolify Application Settings
1. Go to your application in Coolify
2. Check "Server" dropdown - ensure a server is selected
3. Check "Destination" - ensure it's set correctly

## If Using Coolify Cloud
- Check your subscription status
- Verify server limits haven't been reached
- Check Coolify status page for any ongoing issues

## Still Having Issues?

1. **Check Coolify Logs**:
   ```bash
   docker logs coolify --tail 100
   ```

2. **Check Application Logs**:
   - In Coolify dashboard, go to your application
   - Click on "Logs" to see deployment logs

3. **Verify Network Connectivity**:
   ```bash
   # From your local machine
   ping your-coolify-server-ip
   
   # Test SSH
   ssh root@your-coolify-server-ip "echo 'Connection successful'"
   ```

4. **Check Firewall Rules**:
   - Ensure ports 22 (SSH), 80 (HTTP), 443 (HTTPS) are open
   - Check if Docker ports are accessible

## Emergency Recovery

If nothing else works:

1. **Restart the entire server**:
   ```bash
   sudo reboot
   ```

2. **Reinstall Coolify** (last resort):
   ```bash
   curl -fsSL https://get.coolify.io | bash
   ```

Remember to backup your data before any major changes!