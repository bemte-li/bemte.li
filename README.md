# Bemteli

## Development Setup

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- OpenSSL (usually pre-installed on most systems)
- Make

### Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bemteli.git
cd bemteli
```

2. Run the development setup:
```bash
make setup
```

3. Start the development environment:
```bash
make dev
```

### Available Make Commands

```bash
make help          # Show all available commands
make setup         # Initial development setup
make dev           # Start development environment
make down          # Stop development environment
make restart       # Restart development environment
make logs          # Show logs from all containers
make frontend-logs # Show frontend logs
make backend-logs  # Show backend logs
make mail-logs     # Show mail server logs
make clean         # Clean up development environment (requires sudo)
make test         # Run tests
make lint         # Run linters
```

Note: The `clean` command requires sudo privileges to remove Docker volume directories.

### Accessing Local Services

Once the environment is running, you can access:

- Frontend: https://localhost
- Backend API: https://api.localhost
- Mail Server Interface: https://mail.localhost

Note: Since we're using self-signed certificates for local development, your browser will show a security warning. This is expected and safe for local development.

### Development Workflow

- The frontend runs in development mode with hot-reloading enabled
- Changes to the frontend code will automatically reflect in the browser
- Backend runs with Air for hot-reloading:
  - Changes to Go files will automatically trigger a rebuild
  - No manual container restart needed for most changes
  - Database migrations are automatically applied in development mode

### Development Superuser

In development mode, a default superuser account is automatically created with the following credentials:
- Email: dev@bemte.li
- Password: dev1234567

You can use these credentials to access the admin interface and manage your development environment.

### Troubleshooting

1. Certificate Issues
   - If you see certificate warnings, this is normal for local development
   - You can regenerate certificates by running `make clean` followed by `make setup`

2. Port Conflicts
   - If you see port binding errors, make sure no other services are using ports 80, 443, 3000, or 8090
   - Stop conflicting services or modify the port mappings in `docker/docker-compose.dev.yml`

3. Host Resolution
   - If you can't access the services, verify your `/etc/hosts` entries
   - Run `make setup` again to add missing entries

4. Clean Start
   - If you're experiencing unexpected issues, try a clean start:
     ```bash
     make clean   # Remove all development data
     make setup   # Set up fresh environment
     make dev     # Start development environment
     ```
