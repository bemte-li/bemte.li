# Target: squash-migrations
# Description: Squashes the migrations. See https://pocketbase.io/docs/go-migrations/#migrations-history
squash-migrations:
	@echo "Squashing migrations"
	@cd backend && APP_ENV=development go run . migrate history-sync

.PHONY: setup dev down restart logs clean help test lint run-backend run-frontend build-backend squash-migrations

# Colors (using tput with fallback)
COLORIZE := $(shell test -t 0 && echo 1 || echo 0)
ifeq ($(COLORIZE),1)
	BOLD := $(shell tput bold)
	RESET := $(shell tput sgr0)
	BLUE := $(shell tput setaf 4)
	GREEN := $(shell tput setaf 2)
else
	BOLD :=
	RESET :=
	BLUE :=
	GREEN :=
endif

# Docker compose files
DC_DEV = docker compose -p bemteli-dev -f docker/docker-compose.dev.yml
DC_PROD = docker compose -p bemteli-prod -f docker/docker-compose.prod.yml

help: ## Show this help message
	@echo '$(BOLD)Usage:$(RESET)'
	@echo '  make $(BLUE)<target>$(RESET)'
	@echo ''
	@echo '$(BOLD)Targets:$(RESET)'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(BLUE)%-15s$(RESET) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

setup: ## Initial development setup
	@echo "$(BOLD)Setting up development environment...$(RESET)"
	@cd docker && chmod +x setup-dev.sh && ./setup-dev.sh

dev: ## Start development environment
	@echo "$(BOLD)Starting development environment...$(RESET)"
	@${DC_DEV} down --remove-orphans
	@${DC_DEV} build --no-cache pocketbase
	@${DC_DEV} up -d
	@echo "$(GREEN)Development environment is running!$(RESET)"
	@echo "Frontend: $(BLUE)https://localhost$(RESET)"
	@echo "Backend:  $(BLUE)https://api.localhost$(RESET)"
	@echo "Mail UI:  $(BLUE)https://mail.localhost$(RESET)"

down: ## Stop development environment
	@echo "$(BOLD)Stopping development environment...$(RESET)"
	@${DC_DEV} down --remove-orphans

restart: ## Restart development environment
	@echo "$(BOLD)Restarting development environment...$(RESET)"
	@${DC_DEV} restart

logs: ## Show logs from all containers
	@${DC_DEV} logs -f

frontend-logs: ## Show frontend logs
	@${DC_DEV} logs -f frontend

backend-logs: ## Show backend logs
	@${DC_DEV} logs -f pocketbase

mail-logs: ## Show mail server logs
	@${DC_DEV} logs -f stalwart

clean: ## Clean up development environment (removes volumes, certificates)
	@echo "$(BOLD)Cleaning up development environment...$(RESET)"
	@${DC_DEV} down -v --remove-orphans
	@echo "$(BOLD)Removing directories (requires sudo)...$(RESET)"
	@sudo rm -rf docker/nginx/ssl
	@sudo rm -rf docker/backend/pb_data
	@sudo rm -rf docker/stalwart
	@echo "$(GREEN)Cleanup complete!$(RESET)"

test: ## Run tests
	@echo "$(BOLD)Running tests...$(RESET)"
	@cd frontend && npm test
	@cd backend && go test ./...

lint: ## Run linters
	@echo "$(BOLD)Running linters...$(RESET)"
	@cd frontend && npm run lint
	@cd backend && go vet ./...

# Default target
.DEFAULT_GOAL := help
