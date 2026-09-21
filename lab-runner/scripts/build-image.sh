#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_CONTEXT="${SCRIPT_DIR}/../docker/linux-security"

echo "Building Docker image: nisqvanguard/linux-security:latest..."
docker build -t nisqvanguard/linux-security:latest -t nisq-linux-security-fundamentals:local "${DOCKER_CONTEXT}"
echo "Successfully built nisqvanguard/linux-security:latest"
