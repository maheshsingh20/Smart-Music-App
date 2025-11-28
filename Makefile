.PHONY: help build up down restart logs clean rebuild

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Build Docker images
	docker-compose build

up: ## Start all containers
	docker-compose up -d
	@echo "✓ Containers started!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:5000"

down: ## Stop and remove containers
	docker-compose down

restart: ## Restart all containers
	docker-compose restart

logs: ## View logs from all containers
	docker-compose logs -f

logs-server: ## View server logs
	docker-compose logs -f server

logs-client: ## View client logs
	docker-compose logs -f client

logs-db: ## View MongoDB logs
	docker-compose logs -f mongodb

ps: ## List running containers
	docker-compose ps

clean: ## Remove containers, networks, and volumes
	docker-compose down -v
	docker system prune -f

rebuild: ## Rebuild and restart all containers
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d
	@echo "✓ Containers rebuilt and started!"

shell-server: ## Access server container shell
	docker exec -it music-app-server sh

shell-db: ## Access MongoDB shell
	docker exec -it music-app-mongodb mongosh music-app

backup-db: ## Backup MongoDB database
	docker exec music-app-mongodb mongodump --out=/backup
	docker cp music-app-mongodb:/backup ./mongodb-backup-$(shell date +%Y%m%d-%H%M%S)
	@echo "✓ Database backed up!"

restore-db: ## Restore MongoDB database (usage: make restore-db BACKUP=./mongodb-backup-20240101-120000)
	docker cp $(BACKUP) music-app-mongodb:/backup
	docker exec music-app-mongodb mongorestore /backup
	@echo "✓ Database restored!"

stats: ## Show container resource usage
	docker stats

dev: ## Start in development mode with hot reload
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

prod: ## Start in production mode
	docker-compose -f docker-compose.yml up -d

install: ## Initial setup - copy env file and build
	@if [ ! -f .env ]; then \
		cp .env.docker .env; \
		echo "✓ Created .env file. Please edit it with your credentials."; \
	fi
	@make build
	@echo "✓ Setup complete! Run 'make up' to start the application."
