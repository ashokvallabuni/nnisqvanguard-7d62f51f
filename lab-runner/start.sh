#!/bin/bash
# Start Docker daemon in the background
dockerd &

# Wait for Docker to be ready
until docker info >/dev/null 2>&1; do
    echo "Waiting for Docker daemon..."
    sleep 1
done

echo "Docker daemon started."

# Pre-pull the required image so the first lab starts fast
echo "Pulling nisqvanguard/linux-security:latest..."
docker pull nisqvanguard/linux-security:latest

echo "Starting lab-runner server..."
export PORT=8080
export LAB_RUNNER_PORT=8080
export LAB_RUNNER_HOST=0.0.0.0
export LAB_DOCKER_ENABLED=true
export LAB_RUNNER_ENABLED=true
export LAB_DOCKER_IMAGE=nisqvanguard/linux-security:latest

exec npm start
