# Variables
PROJECT_NAME = pong_project
DOCKER_COMPOSE = docker-compose.yml

# Docker Compose Targets
.PHONY: up down stop restart remove_volumes clean migrate makemigrations shell dbshell

# Start all services (database, web server)
up:
	@echo "Starting all services..."
	docker-compose -f $(DOCKER_COMPOSE) up -d

# Stop all services
down:
	@echo "Stopping all services..."
	docker-compose -f $(DOCKER_COMPOSE) down

# Stop services without removing them
stop:
	@echo "Stopping services without removing..."
	docker-compose -f $(DOCKER_COMPOSE) stop

# Restart all services
restart:
	@echo "Restarting all services..."
	docker-compose -f $(DOCKER_COMPOSE) down && docker-compose -f $(DOCKER_COMPOSE) up -d

# Remove Docker volumes
remove_volumes:
	@echo "Removing volumes..."
	docker-compose -f $(DOCKER_COMPOSE) down -v

# Clean everything (containers, volumes, networks, images)
clean:
	@echo "Cleaning all services, volumes, and images..."
	docker-compose -f $(DOCKER_COMPOSE) down --rmi all -v

# Django commands
migrate:
	@echo "Running migrations..."
	docker-compose -f $(DOCKER_COMPOSE) exec web python manage.py migrate

makemigrations:
	@echo "Making migrations..."
	docker-compose -f $(DOCKER_COMPOSE) exec web python manage.py makemigrations

shell:
	@echo "Opening Django shell..."
	docker-compose -f $(DOCKER_COMPOSE) exec web python manage.py shell

dbshell:
	@echo "Opening PostgreSQL shell..."
	docker-compose -f $(DOCKER_COMPOSE) exec db psql -U ${DATABASE_USER} ${DATABASE_NAME}
