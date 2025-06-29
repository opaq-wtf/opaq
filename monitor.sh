#!/bin/bash

# OPAQ.WTF Monitoring Script
# This script provides monitoring and management commands

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

show_help() {
    print_header "OPAQ.WTF Management Commands"
    echo ""
    echo "Usage: ./monitor.sh [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  status    - Show service status"
    echo "  logs      - Show application logs"
    echo "  restart   - Restart all services"
    echo "  stop      - Stop all services"
    echo "  start     - Start all services"
    echo "  update    - Pull latest changes and redeploy"
    echo "  health    - Check application health"
    echo "  backup    - Create backup of logs and data"
    echo "  cleanup   - Clean up old Docker images and containers"
    echo "  help      - Show this help message"
}

show_status() {
    print_header "=== Service Status ==="
    docker-compose ps
    echo ""
    print_header "=== Docker System Info ==="
    docker system df
}

show_logs() {
    print_status "Showing logs (Press Ctrl+C to exit)..."
    docker-compose logs -f --tail=100
}

restart_services() {
    print_status "Restarting services..."
    docker-compose restart
    print_status "Services restarted successfully"
}

stop_services() {
    print_status "Stopping services..."
    docker-compose down
    print_status "Services stopped"
}

start_services() {
    print_status "Starting services..."
    docker-compose up -d
    print_status "Services started"
}

update_deployment() {
    print_status "Updating deployment..."
    git pull origin main
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    print_status "Update completed"
}

check_health() {
    print_header "=== Health Check ==="

    # Check if containers are running
    if docker-compose ps | grep -q "Up"; then
        print_status "✅ Containers are running"
    else
        print_error "❌ Some containers are not running"
        docker-compose ps
        return 1
    fi

    # Check application health endpoint
    print_status "Checking application health endpoint..."
    if curl -f -s http://localhost/health >/dev/null; then
        print_status "✅ Application health check passed"
        curl -s http://localhost/health | jq .
    else
        print_error "❌ Application health check failed"
    fi

    # Check disk space
    print_status "Checking disk space..."
    df -h
}

create_backup() {
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p $BACKUP_DIR

    print_status "Creating backup in $BACKUP_DIR..."

    # Backup logs
    docker-compose logs >"$BACKUP_DIR/application.log"

    # Backup environment files
    cp .env* "$BACKUP_DIR/" 2>/dev/null || true

    # Backup configuration
    cp docker-compose.yml "$BACKUP_DIR/"
    cp nginx/default.conf "$BACKUP_DIR/"

    print_status "Backup created successfully in $BACKUP_DIR"
}

cleanup_docker() {
    print_status "Cleaning up Docker system..."
    docker system prune -f
    docker image prune -f
    print_status "Docker cleanup completed"
}

# Main script logic
case "$1" in
"status")
    show_status
    ;;
"logs")
    show_logs
    ;;
"restart")
    restart_services
    ;;
"stop")
    stop_services
    ;;
"start")
    start_services
    ;;
"update")
    update_deployment
    ;;
"health")
    check_health
    ;;
"backup")
    create_backup
    ;;
"cleanup")
    cleanup_docker
    ;;
"help" | "")
    show_help
    ;;
*)
    print_error "Unknown command: $1"
    show_help
    exit 1
    ;;
esac
