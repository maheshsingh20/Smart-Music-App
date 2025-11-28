# 🐳 Docker Deployment Guide

This guide will help you run the Smart Music App using Docker and Docker Compose.

## 📋 Prerequisites

- Docker 20.x or higher
- Docker Compose 2.x or higher
- 4GB RAM minimum
- 10GB free disk space

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/maheshsingh20/Smart-Music-App.git
cd Smart-Music-App
```

### 2. Configure environment variables
```bash
# Copy the example environment file
cp .env.docker .env

# Edit .env and add your API credentials
nano .env  # or use your preferred editor
```

Required variables:
- `JAMENDO_CLIENT_ID` - Get from [Jamendo Developer Portal](https://devportal.jamendo.com/)
- `JWT_SECRET` - Generate a strong random string
- `JWT_REFRESH_SECRET` - Generate another strong random string

### 3. Build and start the containers
```bash
docker-compose up -d
```

This will:
- Build the client and server Docker images
- Pull the MongoDB image
- Create a network for the containers
- Start all services in detached mode

### 4. Access the application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

## 📦 Container Architecture

```
┌─────────────────────────────────────────────┐
│           music-app-network                 │
│                                             │
│  ┌──────────────┐  ┌──────────────┐       │
│  │   Client     │  │   Server     │       │
│  │  (Nginx)     │  │  (Node.js)   │       │
│  │  Port: 80    │  │  Port: 5000  │       │
│  └──────────────┘  └──────────────┘       │
│         │                  │               │
│         │                  │               │
│         │          ┌───────▼────────┐     │
│         │          │   MongoDB      │     │
│         │          │   Port: 27017  │     │
│         │          └────────────────┘     │
│         │                                  │
└─────────┼──────────────────────────────────┘
          │
    Host: 3000
```

## 🛠️ Docker Commands

### View running containers
```bash
docker-compose ps
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f mongodb
```

### Stop containers
```bash
docker-compose stop
```

### Start containers
```bash
docker-compose start
```

### Restart containers
```bash
docker-compose restart
```

### Stop and remove containers
```bash
docker-compose down
```

### Stop and remove containers + volumes (deletes database)
```bash
docker-compose down -v
```

### Rebuild containers
```bash
# Rebuild all
docker-compose build

# Rebuild specific service
docker-compose build server
docker-compose build client

# Rebuild and restart
docker-compose up -d --build
```

## 🔍 Troubleshooting

### Check container health
```bash
docker-compose ps
```

Look for "healthy" status on all containers.

### Access container shell
```bash
# Server container
docker exec -it music-app-server sh

# MongoDB container
docker exec -it music-app-mongodb mongosh
```

### View container resource usage
```bash
docker stats
```

### Check MongoDB connection
```bash
docker exec -it music-app-mongodb mongosh music-app
```

### Clear everything and start fresh
```bash
# Stop and remove containers, networks, and volumes
docker-compose down -v

# Remove images
docker rmi music-app-server music-app-client

# Rebuild and start
docker-compose up -d --build
```

## 🔧 Configuration

### Environment Variables

Edit `.env` file to configure:

```env
# JWT Secrets
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Music Provider
MUSIC_PROVIDER=jamendo

# API Credentials
JAMENDO_CLIENT_ID=your-client-id
```

### Port Configuration

Edit `docker-compose.yml` to change ports:

```yaml
services:
  client:
    ports:
      - "8080:80"  # Change 8080 to your desired port
  
  server:
    ports:
      - "5001:5000"  # Change 5001 to your desired port
```

### MongoDB Persistence

Data is persisted in Docker volumes:
- `mongodb_data` - Database files
- `mongodb_config` - Configuration files

To backup MongoDB:
```bash
docker exec music-app-mongodb mongodump --out=/backup
docker cp music-app-mongodb:/backup ./mongodb-backup
```

To restore MongoDB:
```bash
docker cp ./mongodb-backup music-app-mongodb:/backup
docker exec music-app-mongodb mongorestore /backup
```

## 🚀 Production Deployment

### 1. Use production environment file
```bash
cp .env.docker .env.production
# Edit .env.production with production values
```

### 2. Update docker-compose for production
```yaml
services:
  server:
    environment:
      - NODE_ENV=production
      - CORS_ORIGIN=https://yourdomain.com
```

### 3. Use reverse proxy (Nginx/Traefik)
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. Enable SSL with Let's Encrypt
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com
```

### 5. Set up monitoring
```bash
# Add to docker-compose.yml
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
```

## 📊 Performance Optimization

### Resource Limits
Add to `docker-compose.yml`:

```yaml
services:
  server:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Multi-stage Builds
Already implemented in Dockerfiles for smaller image sizes.

### Caching
Nginx is configured to cache static assets for 1 year.

## 🔒 Security Best Practices

1. **Change default secrets** in `.env`
2. **Use strong passwords** for MongoDB (if authentication enabled)
3. **Enable MongoDB authentication** in production
4. **Use HTTPS** in production
5. **Keep Docker images updated**:
   ```bash
   docker-compose pull
   docker-compose up -d
   ```
6. **Scan for vulnerabilities**:
   ```bash
   docker scan music-app-server
   docker scan music-app-client
   ```

## 📈 Scaling

### Horizontal Scaling (Multiple Instances)
```bash
docker-compose up -d --scale server=3
```

### Load Balancing
Add Nginx load balancer:
```yaml
  nginx-lb:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
    depends_on:
      - server
```

## 🆘 Common Issues

### Port already in use
```bash
# Find process using port
netstat -ano | findstr :3000

# Kill process or change port in docker-compose.yml
```

### MongoDB connection failed
```bash
# Check MongoDB is running
docker-compose ps mongodb

# Check logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Build fails
```bash
# Clear Docker cache
docker builder prune

# Rebuild without cache
docker-compose build --no-cache
```

### Out of disk space
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything unused
docker system prune -a --volumes
```

## 📝 Development with Docker

### Hot reload for development
Create `docker-compose.dev.yml`:

```yaml
version: '3.8'

services:
  server:
    build:
      context: .
      dockerfile: Dockerfile.server
    volumes:
      - ./server:/app
      - /app/node_modules
    command: npm run dev

  client:
    build:
      context: .
      dockerfile: Dockerfile.client
    volumes:
      - ./client:/app
      - /app/node_modules
    command: npm run dev
```

Run with:
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## 🎯 Next Steps

- Set up CI/CD pipeline
- Configure monitoring and logging
- Implement backup strategy
- Set up staging environment
- Configure auto-scaling

---

For more information, see the main [README.md](README.md)
