#!/bin/bash
set -e

# Configuration
PRIMARY_DOMAIN=${1:-bemte.li}
EMAIL=${2:-admin@bemte.li}
CERTBOT_DIR="./docker/certbot"

# Create required directories
mkdir -p $CERTBOT_DIR/conf
mkdir -p $CERTBOT_DIR/www

# Check if certificates already exist
if [ -d "$CERTBOT_DIR/conf/live/$PRIMARY_DOMAIN" ]; then
  echo "Certificates for $PRIMARY_DOMAIN already exist. Use renew-certificates.sh to renew them."
  exit 0
fi

# Stop nginx if it's running to free up port 80
echo "Stopping nginx container if running..."
docker compose -f docker/docker-compose.prod.yml stop nginx || true

# Run certbot in standalone mode to obtain certificates
echo "Obtaining certificates for $PRIMARY_DOMAIN and subdomains..."
docker run --rm \
  -v "$PWD/$CERTBOT_DIR/conf:/etc/letsencrypt" \
  -v "$PWD/$CERTBOT_DIR/www:/var/www/certbot" \
  -p 80:80 \
  certbot/certbot certonly --standalone \
  --preferred-challenges http \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$PRIMARY_DOMAIN" \
  -d "www.$PRIMARY_DOMAIN" \
  -d "mail.$PRIMARY_DOMAIN" \
  -d "api.$PRIMARY_DOMAIN"

# Restart nginx
echo "Starting nginx container..."
docker compose -f docker/docker-compose.prod.yml up -d nginx

echo "Certificate creation completed successfully!"
echo "Certificates are stored in $CERTBOT_DIR/conf/"
echo "To renew certificates, run the renew-certificates.sh script." 