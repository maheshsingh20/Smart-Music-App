# 🐳 Docker Quick Start Guide

Get your Smart Music App running with Docker in 5 minutes!

## Prerequisites

- **Docker Desktop** installed ([Download here](https://www.docker.com/products/docker-desktop))
- **4GB RAM** minimum
- **10GB disk space**

## 🚀 Quick Start (3 Steps)

### Step 1: Get API Credentials

Visit [Jamendo Developer Portal](https://devportal.jamendo.com/) and:
1. Create a free account
2. Register your app
3. Copy your **Client ID**

### Step 2: Configure Environment

**Windows:**
```cmd
docker-start.bat
```

**Linux/Mac:**
```bash
chmod +x docker-start.sh
./docker-start.sh
```

Or manually:
```bash
# Copy environment template
cp .env.docker .env

# Edit and add your Jamendo Client ID
notepad .env  # Windows
nano .env     # Linux/Mac
```

### Step 3: Start the App

```bash
docker-compose up -d
```

That's it! 🎉

## 📱 Access Your App

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🎮 Common Commands

```bash
# View logs
docker-compose logs -f

# Stop the app
docker-compose down

# Restart
docker-compose restart

# Rebuild after code changes
docker-compose up -d --build

# View running containers
docker-compose ps

# Check resource usage
docker stats
```

## 🛠️ Using Makefile (Easier!)

If you have `make` installed:

```bash
# Install and setup
make install

# Start
make up

# View logs
make logs

# Stop
make down

# Rebuild
make rebuild

# See all commands
make help
```

## 🔍 Troubleshooting

### Port Already in Use

**Error:** `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution:**
```bash
# Windows - Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Or change port in docker-compose.yml
```

### MongoDB Connection Failed

```bash
# Check MongoDB is running
docker-compose ps mongodb

# Restart MongoDB
docker-compose restart mongodb

# View MongoDB logs
docker-compose logs mongodb
```

### Build Failed

```bash
# Clear Docker cache
docker builder prune

# Rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

### Out of Memory

```bash
# Check Docker resources
docker stats

# Increase Docker Desktop memory:
# Docker Desktop → Settings → Resources → Memory
# Set to at least 4GB
```

## 🧹 Clean Up

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (deletes database!)
docker-compose down -v

# Remove all unused Docker data
docker system prune -a
```

## 📊 Container Status

Check if all containers are healthy:

```bash
docker-compose ps
```

You should see:
```
NAME                    STATUS
music-app-client        Up (healthy)
music-app-server        Up (healthy)
music-app-mongodb       Up (healthy)
```

## 🔐 Security Notes

1. **Change JWT secrets** in `.env` before production
2. **Never commit** `.env` file to Git
3. **Use strong passwords** for production MongoDB
4. **Enable HTTPS** in production

## 🚀 Production Deployment

For production deployment, see [DOCKER.md](DOCKER.md) for:
- SSL/HTTPS setup
- Reverse proxy configuration
- Monitoring and logging
- Backup strategies
- Scaling options

## 💡 Tips

- **First run takes longer** - Docker downloads images and builds containers
- **Subsequent starts are fast** - Docker uses cached images
- **Data persists** - MongoDB data is stored in Docker volumes
- **Hot reload** - Code changes require rebuild: `docker-compose up -d --build`

## 📚 Learn More

- [Full Docker Documentation](DOCKER.md)
- [Main README](README.md)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 🆘 Need Help?

1. Check logs: `docker-compose logs -f`
2. Check container status: `docker-compose ps`
3. Restart everything: `docker-compose restart`
4. Start fresh: `docker-compose down -v && docker-compose up -d --build`

---

Happy coding! 🎵
