#!/bin/bash

# Docker Development Helper Script
# Usage: ./docker-dev.sh [command]

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print colored message
print_msg() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if .env exists
check_env() {
    if [ ! -f .env ]; then
        print_warning ".env file not found!"
        print_msg "Copying .env.docker.example to .env..."
        cp .env.docker.example .env
        print_success ".env file created"
        print_warning "Please review and update .env file with your settings"
    else
        print_success ".env file exists"
    fi
}

# Start development
dev_start() {
    print_msg "Starting development environment..."
    check_env
    docker-compose up app
}

# Start with build
dev_build() {
    print_msg "Building and starting development environment..."
    check_env
    docker-compose up --build app
}

# Stop services
dev_stop() {
    print_msg "Stopping development environment..."
    docker-compose down
    print_success "Development environment stopped"
}

# Restart app
dev_restart() {
    print_msg "Restarting app container..."
    docker-compose restart app
    print_success "App container restarted"
}

# View logs
dev_logs() {
    print_msg "Showing app logs (Ctrl+C to exit)..."
    docker-compose logs -f app
}

# Clean everything
dev_clean() {
    print_warning "This will remove all containers, volumes, and orphans!"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_msg "Cleaning Docker environment..."
        docker-compose down -v --remove-orphans
        print_success "Environment cleaned"
    else
        print_msg "Clean cancelled"
    fi
}

# Status
dev_status() {
    print_msg "Docker services status:"
    docker-compose ps
    echo ""
    print_msg "App container logs (last 20 lines):"
    docker-compose logs --tail=20 app
}

# Shell access
dev_shell() {
    print_msg "Opening shell in app container..."
    docker-compose exec app sh
}

# Database shell
dev_db() {
    print_msg "Connecting to PostgreSQL..."
    docker-compose exec postgres psql -U postgres -d cameroonmemoria
}

# Run migrations
dev_migrate() {
    print_msg "Running Prisma migrations..."
    docker-compose exec app pnpm prisma migrate deploy
    print_success "Migrations completed"
}

# Seed database
dev_seed() {
    print_msg "Seeding database..."
    docker-compose exec app pnpm db:seed:admin
    print_success "Database seeded"
}

# Reset database
dev_reset() {
    print_warning "This will reset the entire database!"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_msg "Resetting database..."
        docker-compose exec app pnpm db:reset
        print_success "Database reset"
    else
        print_msg "Reset cancelled"
    fi
}

# Help
show_help() {
    cat << EOF
${BLUE}Cameroon Memoria - Docker Development Helper${NC}

${GREEN}Usage:${NC}
  ./docker-dev.sh [command]

${GREEN}Commands:${NC}
  ${YELLOW}start${NC}      Start development server (with hot reload)
  ${YELLOW}build${NC}      Build and start development server
  ${YELLOW}stop${NC}       Stop all services
  ${YELLOW}restart${NC}    Restart the app container
  ${YELLOW}logs${NC}       View app logs in real-time
  ${YELLOW}status${NC}     Show service status and recent logs
  ${YELLOW}clean${NC}      Remove all containers and volumes

  ${YELLOW}shell${NC}      Open shell in app container
  ${YELLOW}db${NC}         Connect to PostgreSQL database

  ${YELLOW}migrate${NC}    Run Prisma migrations
  ${YELLOW}seed${NC}       Seed database with admin user
  ${YELLOW}reset${NC}      Reset database (WARNING: deletes all data)

  ${YELLOW}help${NC}       Show this help message

${GREEN}Examples:${NC}
  ./docker-dev.sh start      # Start development
  ./docker-dev.sh build      # Fresh build and start
  ./docker-dev.sh logs       # View logs
  ./docker-dev.sh shell      # Access container shell
  ./docker-dev.sh migrate    # Run database migrations

${GREEN}Quick Start:${NC}
  1. Run: ./docker-dev.sh build
  2. Wait for services to start
  3. Open: http://localhost:3000

${GREEN}Access Points:${NC}
  App:          http://localhost:3000
  MinIO Console: http://localhost:9001 (minioadmin/minioadmin)
  PostgreSQL:    localhost:5432 (postgres/postgres)

For more details, see: ${BLUE}DOCKER-SETUP.md${NC}
EOF
}

# Main script logic
case "${1:-help}" in
    start)
        dev_start
        ;;
    build)
        dev_build
        ;;
    stop)
        dev_stop
        ;;
    restart)
        dev_restart
        ;;
    logs)
        dev_logs
        ;;
    clean)
        dev_clean
        ;;
    status)
        dev_status
        ;;
    shell)
        dev_shell
        ;;
    db)
        dev_db
        ;;
    migrate)
        dev_migrate
        ;;
    seed)
        dev_seed
        ;;
    reset)
        dev_reset
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
