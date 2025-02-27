# SSL Certificate Management Scripts

This directory contains scripts for managing SSL certificates using Certbot without requiring a dedicated container in the docker-compose configuration.

## Available Scripts

### 1. `create-certificates.sh`

Creates new SSL certificates for bemte.li and its subdomains (www.bemte.li, mail.bemte.li, and api.bemte.li).

**Usage:**
```bash
./create-certificates.sh [primary_domain] [email]
```

**Example:**
```bash
./create-certificates.sh bemte.li admin@bemte.li
```

If no arguments are provided, it will use default values (bemte.li and admin@bemte.li).

### 2. `renew-certificates.sh`

Renews existing SSL certificates.

**Usage:**
```bash
./renew-certificates.sh
```

This script will automatically renew any certificates that are due for renewal.

### 3. `setup-cert-renewal-cron.sh`

Sets up a cron job to automatically renew certificates weekly.

**Usage:**
```bash
./setup-cert-renewal-cron.sh
```

This will create a cron job that runs the renewal script at 3:30 AM every Monday.

## Initial Setup

1. Make the scripts executable:
   ```bash
   chmod +x docker/scripts/*.sh
   ```

2. Create initial certificates:
   ```bash
   ./docker/scripts/create-certificates.sh bemte.li your@email.com
   ```

3. Set up automatic renewal:
   ```bash
   ./docker/scripts/setup-cert-renewal-cron.sh
   ```

## Notes

- The certificates are stored in `docker/certbot/conf/`
- Renewal logs are saved to `docker/certbot/renewal.log`
- The scripts temporarily stop the nginx container during certificate operations to free up port 80
- These scripts use Certbot in standalone mode, which requires port 80 to be available during certificate operations
- The certificates will cover the following domains:
  - bemte.li
  - www.bemte.li
  - mail.bemte.li
  - api.bemte.li 