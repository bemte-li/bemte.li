# Target: run-backend
# Description: Runs the backend application.
run-backend:
	@echo "Running backend"
	@cd backend && go run main.go serve

# Target: build-backend
# Description: Builds the backend application.
build-backend:
	@echo "Building backend"
	@cd backend && CGO_ENABLED=0 go build

# Target: squash-migrations
# Description: Squashes the migrations. See https://pocketbase.io/docs/go-migrations/#migrations-history
squash-migrations:
	@echo "Squashing migrations"
	@cd backend && go run main.go migrate history-sync
