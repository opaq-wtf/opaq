#!/bin/bash

# OPAQ.WTF Deployment Script
# This script deploys the application to production

set -e # Exit on any error

echo "🚀 Starting deployment for opaq.wtf..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker compose is available
if ! command -v docker compose &>/dev/null; then
    print_error "docker compose is not installed. Please install it and try again."
    exit 1
fi

print_status "Stopping existing containers..."
docker compose down --remove-orphans

print_status "Removing old images to save space..."
docker system prune -f

print_status "Building new images..."
docker compose build --no-cache

print_status "Starting services..."
docker compose up -d

print_status "Waiting for services to be healthy..."
sleep 30

# Check if services are running
if docker compose ps | grep -q "Up"; then
    print_status "✅ Deployment successful!"
    print_status "Your application is now running at: https://opaq.wtf"

    echo ""
    print_status "Service status:"
    docker compose ps

    echo ""
    print_status "To view logs, run:"
    echo "  docker compose logs -f"

    echo ""
    print_status "To stop the application, run:"
    echo "  docker compose down"
else
    print_error "❌ Deployment failed! Check the logs:"
    docker compose logs
    exit 1
fi
