#!/bin/bash
set -e

# Configuration
CERTBOT_DIR="./docker/certbot"
COMPOSE_FILE="docker/docker-compose.prod.yml"

# Check if certificates exist
if [ ! -d "$CERTBOT_DIR/conf" ] || [ -z "$(ls -A $CERTBOT_DIR/conf)" ]; then
  echo "No certificates found. Please run create-certificates.sh first."
  exit 1
fi

# Stop nginx to free up port 80
echo "Stopping nginx container..."
docker compose -f $COMPOSE_FILE stop nginx || true

# Run certbot renewal
echo "Renewing certificates..."
docker run --rm \
  -v "$PWD/$CERTBOT_DIR/conf:/etc/letsencrypt" \
  -v "$PWD/$CERTBOT_DIR/www:/var/www/certbot" \
  -p 80:80 \
  certbot/certbot renew --standalone

# Restart nginx
echo "Starting nginx container..."
docker compose -f $COMPOSE_FILE up -d nginx

echo "Certificate renewal process completed!" 