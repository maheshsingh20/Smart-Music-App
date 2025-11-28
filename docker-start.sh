#!/bin/bash

echo "========================================"
echo " Smart Music App - Docker Setup"
echo "========================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed"
    echo "Please install Docker from https://www.docker.com/get-started"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "ERROR: Docker Compose is not installed"
    echo "Please install Docker Compose"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.docker .env
    echo ""
    echo "IMPORTANT: Please edit .env file and add your API credentials!"
    echo "Opening .env file..."
    ${EDITOR:-nano} .env
fi

echo ""
echo "Building and starting Docker containers..."
echo "This may take a few minutes on first run..."
echo ""

docker-compose up -d --build

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo " SUCCESS! Application is running"
    echo "========================================"
    echo ""
    echo " Frontend: http://localhost:3000"
    echo " Backend:  http://localhost:5000"
    echo ""
    echo "To view logs: docker-compose logs -f"
    echo "To stop:      docker-compose down"
    echo ""
else
    echo ""
    echo "ERROR: Failed to start containers"
    echo "Check the error messages above"
    echo ""
    exit 1
fi
