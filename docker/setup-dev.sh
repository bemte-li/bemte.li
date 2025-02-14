#!/bin/bash

# Create necessary directories
mkdir -p nginx/ssl

# Generate SSL certificates if they don't exist
if [ ! -f nginx/ssl/localhost.crt ]; then
    echo "Generating SSL certificates..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/localhost.key \
        -out nginx/ssl/localhost.crt \
        -subj "/C=US/ST=State/L=City/O=Development/CN=localhost"
fi

# Add hosts entries if they don't exist
for host in "localhost" "api.localhost" "mail.localhost"; do
    if ! grep -q "$host" /etc/hosts; then
        echo "Adding $host to /etc/hosts (requires sudo)..."
        echo "127.0.0.1 $host" | sudo tee -a /etc/hosts
    fi
done

echo "Setup complete! You can now run: docker-compose -f docker-compose.dev.yml up -d" 