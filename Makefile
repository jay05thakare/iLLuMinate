# iLLuMinate Development Makefile
# SAAS Platform for Cement Industry Sustainability Management

.PHONY: help install dev test lint build clean db-setup migrate migrate-create migrate-status migrate-rollback db-reset db-seed

# Default target
help:
	@echo "iLLuMinate Development Commands"
	@echo "=============================="
	@echo ""
	@echo "Setup Commands:"
	@echo "  install         Install all dependencies (Node.js, Python)"
	@echo "  setup           Complete project setup (install + env)"
	@echo ""
	@echo "Development Commands:"
	@echo "  dev             Start development servers (Node.js, Python, React)"
	@echo "  dev-backend     Start only backend development server"
	@echo "  dev-frontend    Start only frontend development server"
	@echo "  dev-ai          Start only AI services development server"
	@echo ""
	@echo "Code Quality Commands:"
	@echo "  test            Run all tests (backend, frontend, AI services)"
	@echo "  test-backend    Run backend tests only"
	@echo "  test-frontend   Run frontend tests only"
	@echo "  test-ai         Run AI services tests only"
	@echo "  lint            Run linting and formatting (ESLint, Prettier, Black)"
	@echo "  lint-fix        Run linting with auto-fix"
	@echo ""
	@echo "Build Commands:"
	@echo "  build           Build production artifacts"
	@echo "  build-frontend  Build frontend only"
	@echo "  build-backend   Build backend only"
	@echo ""
	@echo "Database Commands:"
	@echo "  db-setup        Setup database with Docker"
	@echo "  db-start        Start database services (PostgreSQL, Redis)"
	@echo "  db-stop         Stop database services"
	@echo "  db-connect      Connect to PostgreSQL database"
	@echo "  db-logs         Show PostgreSQL logs"
	@echo "  migrate         Run database migrations"
	@echo "  migrate-create  Create new migration file"
	@echo "  migrate-status  Check migration status"
	@echo "  migrate-history Show migration history"
	@echo "  migrate-rollback Roll back last migration"
	@echo "  db-reset        Reset database with JK Cement real data"
	@echo "  db-reset-sample Reset database with sample data"
	@echo "  db-seed         Seed database with sample data"
	@echo "  db-backup       Create database backup"
	@echo "  db-restore      Restore database from backup"
	@echo "  pgadmin         Start PgAdmin web interface"
	@echo ""
	@echo "Utility Commands:"
	@echo "  clean           Clean build artifacts"
	@echo "  logs            Show application logs"
	@echo ""
	@echo "Phase 1 Testing Commands:"
	@echo "  test-health     Test health endpoints of all services"
	@echo "  test-all-endpoints Test all available API endpoints"
	@echo "  start-all       Start all services in background"
	@echo "  stop-all        Stop all background services"
	@echo ""

# Setup Commands
install:
	@echo "🔧 Installing dependencies..."
	@echo "Installing backend dependencies..."
	@cd backend && npm install
	@echo "Installing frontend dependencies..."
	@cd frontend && npm install
	@echo "Installing AI services dependencies..."
	@cd ai-services && pip install -r requirements.txt
	@echo "✅ All dependencies installed successfully!"

setup: install
	@echo "🚀 Setting up development environment..."
	@if [ ! -f .env ]; then \
		echo "Creating .env file from template..."; \
		cp .env.example .env; \
		echo "⚠️  Please update .env file with your configuration"; \
	fi
	@echo "✅ Setup completed!"

# Development Commands
dev:
	@echo "🚀 Starting all development servers..."
	@echo "This will start backend (port 3000), frontend (port 5173), and AI services (port 8000)"
	@(cd backend && npm run dev) & \
	(cd frontend && npm run dev) & \
	(cd ai-services && python3 simple_main.py) & \
	wait

dev-backend:
	@echo "🔧 Starting backend development server..."
	@cd backend && npm run dev

dev-frontend:
	@echo "⚛️  Starting frontend development server..."
	@cd frontend && npm run dev

dev-ai:
	@echo "🤖 Starting AI services development server..."
	@cd ai-services && python3 simple_main.py

# Testing Commands
test:
	@echo "🧪 Running all tests..."
	@echo "Running backend tests..."
	@cd backend && npm test
	@echo "Running frontend tests..."
	@cd frontend && npm test
	@echo "Running AI services tests..."
	@cd ai-services && python -m pytest tests/

test-backend:
	@echo "🧪 Running backend tests..."
	@cd backend && npm test

test-frontend:
	@echo "🧪 Running frontend tests..."
	@cd frontend && npm test

test-ai:
	@echo "🧪 Running AI services tests..."
	@cd ai-services && python -m pytest tests/

# Linting Commands
lint:
	@echo "🔍 Running code quality checks..."
	@echo "Linting backend..."
	@cd backend && npm run lint
	@echo "Linting frontend..."
	@cd frontend && npm run lint
	@echo "Linting AI services..."
	@cd ai-services && python -m flake8 src/ tests/
	@cd ai-services && python -m black --check src/ tests/

lint-fix:
	@echo "🔧 Fixing code quality issues..."
	@echo "Fixing backend..."
	@cd backend && npm run lint:fix
	@echo "Fixing frontend..."
	@cd frontend && npm run lint:fix
	@echo "Fixing AI services..."
	@cd ai-services && python -m black src/ tests/

# Build Commands
build:
	@echo "🏗️  Building production artifacts..."
	@make build-frontend
	@make build-backend
	@echo "✅ Build completed successfully!"

build-frontend:
	@echo "⚛️  Building frontend..."
	@cd frontend && npm run build

build-backend:
	@echo "🔧 Building backend..."
	@cd backend && npm run build

# Database Commands
db-setup:
	@echo "🗄️  Setting up database with Docker..."
	@docker-compose up -d postgres
	@echo "Waiting for PostgreSQL to be ready..."
	@sleep 5
	@docker-compose exec postgres pg_isready -U illuminate -d illuminate_db
	@echo "✅ Database setup completed!"

db-start:
	@echo "🚀 Starting database services..."
	@docker-compose up -d postgres redis
	@echo "✅ Database services started!"

db-stop:
	@echo "🛑 Stopping database services..."
	@docker-compose stop postgres redis
	@echo "✅ Database services stopped!"

db-logs:
	@echo "📋 Showing database logs..."
	@docker-compose logs -f postgres

migrate:
	@echo "📊 Running database migrations..."
	@cd backend && npm run migrate

migrate-create:
	@echo "📝 Creating new migration file..."
	@read -p "Enter migration name: " name; \
	timestamp=$$(date +"%Y%m%d%H%M%S"); \
	filename="$${timestamp}_$${name}.sql"; \
	touch "backend/migrations/$${filename}"; \
	echo "-- Migration: $${name}" > "backend/migrations/$${filename}"; \
	echo "-- Created: $$(date +"%Y-%m-%d")" >> "backend/migrations/$${filename}"; \
	echo "-- Description: " >> "backend/migrations/$${filename}"; \
	echo "" >> "backend/migrations/$${filename}"; \
	echo "Created migration: backend/migrations/$${filename}"

migrate-status:
	@echo "📊 Checking migration status..."
	@cd backend && npm run migrate:status

migrate-rollback:
	@echo "🔄 Rolling back last migration..."
	@cd backend && npm run migrate:rollback

migrate-history:
	@echo "📈 Showing migration history..."
	@docker-compose exec postgres psql -U illuminate -d illuminate_db -c "SELECT filename, applied_at, execution_time_ms, success FROM migration_history ORDER BY applied_at;"

db-reset:
	@echo "🗑️  Resetting database with JK Cement data..."
	@docker-compose down -v postgres
	@docker-compose up -d postgres
	@echo "Waiting for PostgreSQL to be ready..."
	@sleep 5
	@cd backend && DB_PASSWORD=illuminate123 npm run migrate
	@cd backend && DB_PASSWORD=illuminate123 npm run db:reset
	@echo "✅ Database reset with JK Cement data completed!"

db-reset-sample:
	@echo "🗑️  Resetting database with sample data..."
	@docker-compose down -v postgres
	@docker-compose up -d postgres
	@echo "Waiting for PostgreSQL to be ready..."
	@sleep 5
	@cd backend && DB_PASSWORD=illuminate123 npm run migrate
	@cd backend && DB_PASSWORD=illuminate123 npm run seed
	@echo "✅ Database reset with sample data completed!"

db-seed:
	@echo "🌱 Seeding database with sample data..."
	@cd backend && npm run seed

db-connect:
	@echo "🔗 Connecting to database..."
	@docker-compose exec postgres psql -U illuminate -d illuminate_db

db-backup:
	@echo "💾 Creating database backup..."
	@mkdir -p backups
	@docker-compose exec postgres pg_dump -U illuminate illuminate_db > backups/illuminate_backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup created in backups/ directory"

db-restore:
	@echo "📥 Restoring database from backup..."
	@read -p "Enter backup filename (from backups/ directory): " filename; \
	docker-compose exec -T postgres psql -U illuminate -d illuminate_db < "backups/$$filename"
	@echo "✅ Database restored!"

pgadmin:
	@echo "🔧 Starting PgAdmin..."
	@docker-compose up -d pgadmin
	@echo "✅ PgAdmin available at http://localhost:8080"
	@echo "   Email: admin@illuminate.com"
	@echo "   Password: admin123"

# Utility Commands
clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf backend/dist/
	@rm -rf frontend/dist/
	@rm -rf backend/node_modules/.cache/
	@rm -rf frontend/node_modules/.cache/
	@find . -name "*.pyc" -delete
	@find . -name "__pycache__" -type d -exec rm -rf {} +
	@echo "✅ Cleanup completed!"

logs:
	@echo "📋 Showing application logs..."
	@echo "Backend logs:"
	@tail -f backend/logs/*.log 2>/dev/null || echo "No backend logs found"

# Phase 1 Testing Commands
test-health:
	@echo "🏥 Testing health endpoints..."
	@echo "Testing Backend Health..."
	@curl -s http://localhost:3000/health | jq . || echo "Backend not running on port 3000"
	@echo ""
	@echo "Testing Frontend (basic check)..."
	@curl -s http://localhost:5173/ | head -10 || echo "Frontend not running on port 5173"
	@echo ""
	@echo "Testing AI Services Health..."
	@curl -s http://localhost:8000/health | jq . || echo "AI Services not running on port 8000"

test-all-endpoints:
	@echo "🌐 Testing all API endpoints..."
	@echo "=== Backend Endpoints ==="
	@echo "Root:"
	@curl -s http://localhost:3000/ | jq .
	@echo ""
	@echo "Health:"
	@curl -s http://localhost:3000/health | jq '.data.status'
	@echo ""
	@echo "Auth (placeholder):"
	@curl -s http://localhost:3000/api/auth/login | jq '.message'
	@echo ""
	@echo "=== AI Services Endpoints ==="
	@echo "Root:"
	@curl -s http://localhost:8000/ | jq '.message'
	@echo ""
	@echo "Health:"
	@curl -s http://localhost:8000/health | jq '.data.status'
	@echo ""
	@echo "Fuel Recommendations (placeholder):"
	@curl -s -X POST http://localhost:8000/api/recommendations/fuel-alternatives | jq '.message'

start-all:
	@echo "🚀 Starting all services in background..."
	@cd backend && npm start > /dev/null 2>&1 & echo "Backend started (PID: $$!)"
	@cd frontend && npm run dev > /dev/null 2>&1 & echo "Frontend started (PID: $$!)"  
	@cd ai-services && python3 simple_main.py > /dev/null 2>&1 & echo "AI Services started (PID: $$!)"
	@echo "All services started. Use 'make test-health' to verify."

stop-all:
	@echo "🛑 Stopping all services..."
	@pkill -f "node.*src/server.js" || echo "No backend process found"
	@pkill -f "vite" || echo "No frontend process found"
	@pkill -f "simple_main.py" || echo "No AI services process found"
	@echo "All services stopped."

# Help target (also default)
.DEFAULT_GOAL := help
