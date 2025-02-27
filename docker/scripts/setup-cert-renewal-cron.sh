#!/bin/bash
set -e

# Get the absolute path to the project directory
PROJECT_DIR=$(cd "$(dirname "$0")/../.." && pwd)
RENEWAL_SCRIPT="$PROJECT_DIR/docker/scripts/renew-certificates.sh"

# Make scripts executable
chmod +x "$PROJECT_DIR/docker/scripts/create-certificates.sh"
chmod +x "$PROJECT_DIR/docker/scripts/renew-certificates.sh"
chmod +x "$PROJECT_DIR/docker/scripts/setup-cert-renewal-cron.sh"

# Create a temporary crontab file
TEMP_CRONTAB=$(mktemp)

# Export current crontab
crontab -l > "$TEMP_CRONTAB" 2>/dev/null || echo "# New crontab" > "$TEMP_CRONTAB"

# Check if the renewal job is already in crontab
if ! grep -q "$RENEWAL_SCRIPT" "$TEMP_CRONTAB"; then
  # Add renewal job to run at 3:30 AM every Monday
  echo "# SSL certificate renewal job - runs at 3:30 AM every Monday" >> "$TEMP_CRONTAB"
  echo "30 3 * * 1 $RENEWAL_SCRIPT >> $PROJECT_DIR/docker/certbot/renewal.log 2>&1" >> "$TEMP_CRONTAB"
  
  # Install the new crontab
  crontab "$TEMP_CRONTAB"
  echo "Certificate renewal cron job has been set up to run weekly."
else
  echo "Certificate renewal cron job already exists."
fi

# Clean up
rm "$TEMP_CRONTAB"

echo "Setup complete. Certificates will be renewed automatically."
echo "You can manually renew certificates by running: $RENEWAL_SCRIPT" 