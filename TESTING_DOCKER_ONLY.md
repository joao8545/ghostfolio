# Testing Custom Data Sources with Docker

This guide explains how to run and test the custom data sources feature using **Docker only** (no local Node.js installation required).

## Prerequisites

- Docker and Docker Compose installed
- Git (to clone the repository)

## Option 1: Using Pre-built Docker Image (Fastest)

This option uses the official Ghostfolio Docker image with your code changes.

### Step 1: Setup Environment

```bash
# Clone the repository (if not already done)
git clone https://github.com/joao8545/ghostfolio.git
cd ghostfolio

# Create .env file from example
cp .env.example .env

# Edit .env file and set secure passwords
# Replace <INSERT_*> placeholders with actual values:
nano .env  # or use your favorite editor
```

Required changes in `.env`:
```bash
REDIS_PASSWORD=your_secure_redis_password
POSTGRES_PASSWORD=your_secure_postgres_password
ACCESS_TOKEN_SALT=your_random_string_here
JWT_SECRET_KEY=your_random_string_here
```

### Step 2: Build Local Docker Image

Since you're testing custom code changes, build a local image:

```bash
# Build the image with your changes
docker compose -f docker/docker-compose.build.yml build

# This creates a local image: ghostfolio/ghostfolio:local
```

This will:
- Build your code changes into a Docker image
- Include the new custom data sources migration
- Tag it as `ghostfolio/ghostfolio:local`

### Step 3: Start Services

```bash
# Start all services (PostgreSQL, Redis, Ghostfolio)
docker compose -f docker/docker-compose.build.yml up -d

# Check logs
docker compose -f docker/docker-compose.build.yml logs -f ghostfolio
```

Wait for the message: `Nest application successfully started` in the logs.

### Step 4: Access the Application

Open your browser to: **http://localhost:3333**

The first user you create will automatically get `ADMIN` role.

### Step 5: Create Admin User

1. Navigate to http://localhost:3333
2. Click "Get Started"
3. Create your account (first user = ADMIN)
4. Login with your credentials

## Option 2: Using Development Docker Setup

For active development with hot-reloading (still Docker-based):

```bash
# Start only the databases
docker compose -f docker/docker-compose.dev.yml up -d

# Check they're running
docker ps
```

Then you can either:
- Run the app in Docker (follow Option 1)
- Or run locally with `npm run start:server` if you have Node.js

## Testing Custom Data Sources API

### Get Your Authentication Token

After logging in:

**Method 1 - Browser DevTools:**
1. Press F12 to open DevTools
2. Go to Application → Local Storage
3. Find `authToken` and copy its value

**Method 2 - From Docker logs:**
```bash
# View the API logs
docker compose -f docker/docker-compose.build.yml logs ghostfolio | grep "authToken"
```

### Test the API Endpoints

Replace `YOUR_AUTH_TOKEN` with your actual token in the commands below:

#### 1. Create a Custom Data Source

```bash
curl -X POST http://localhost:3333/api/v1/admin/custom-data-sources \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "name": "Steam Market CSGO",
    "scraperConfiguration": {
      "url": "https://steamcommunity.com/market/priceoverview/?appid=730&currency=1&market_hash_name=AK-47%20%7C%20Redline%20%28Field-Tested%29",
      "selector": "lowest_price",
      "mode": "instant"
    }
  }'
```

Expected output:
```json
{
  "id": "uuid-here",
  "name": "Steam Market CSGO",
  "scraperConfiguration": {...},
  "userId": "your-user-id",
  "createdAt": "2026-01-31T...",
  "updatedAt": "2026-01-31T..."
}
```

#### 2. Test the Scraper

```bash
# Replace CUSTOM_SOURCE_ID with the ID from previous step
curl -X POST http://localhost:3333/api/v1/admin/custom-data-sources/CUSTOM_SOURCE_ID/test \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

Expected output:
```json
{
  "price": 10.50
}
```

#### 3. List All Custom Data Sources

```bash
curl -X GET http://localhost:3333/api/v1/admin/custom-data-sources \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

#### 4. Update a Custom Data Source

```bash
curl -X PATCH http://localhost:3333/api/v1/admin/custom-data-sources/CUSTOM_SOURCE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "name": "Updated Name"
  }'
```

#### 5. Delete a Custom Data Source

```bash
curl -X DELETE http://localhost:3333/api/v1/admin/custom-data-sources/CUSTOM_SOURCE_ID \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

## Testing Different Scraper Types

### Fixed Price Asset

```bash
curl -X POST http://localhost:3333/api/v1/admin/custom-data-sources \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "name": "Fixed Price Collectible",
    "scraperConfiguration": {
      "defaultMarketPrice": 1000.00,
      "url": "",
      "selector": ""
    }
  }'
```

### JSON API with JSONPath

```bash
curl -X POST http://localhost:3333/api/v1/admin/custom-data-sources \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "name": "JSON API Example",
    "scraperConfiguration": {
      "url": "https://api.example.com/price",
      "selector": "data.price",
      "mode": "instant"
    }
  }'
```

## Inspecting the Database

### Using Docker Exec

Access PostgreSQL directly:

```bash
# Connect to PostgreSQL
docker exec -it gf-postgres-build psql -U user -d ghostfolio-db

# Once connected, run SQL queries:
SELECT * FROM "CustomDataSource";
SELECT * FROM "SymbolProfile" WHERE "customDataSourceId" IS NOT NULL;

# Exit with \q
```

### Using Prisma Studio (Alternative)

If you have Node.js locally:

```bash
# In a separate terminal, with databases running
npm run database:gui
```

Opens at http://localhost:5555

## Viewing Logs

```bash
# View all logs
docker compose -f docker/docker-compose.build.yml logs -f

# View only Ghostfolio app logs
docker compose -f docker/docker-compose.build.yml logs -f ghostfolio

# View only PostgreSQL logs
docker compose -f docker/docker-compose.build.yml logs -f postgres

# Search logs for custom source activity
docker compose -f docker/docker-compose.build.yml logs ghostfolio | grep -i "custom"
```

## Testing with Docker Run Script

Create a test script `docker-test.sh`:

```bash
#!/bin/bash

# Configuration
API_URL="http://localhost:3333/api/v1"
AUTH_TOKEN="YOUR_AUTH_TOKEN_HERE"  # Replace with your token

echo "🧪 Testing Custom Data Sources API..."

# Test 1: Create custom source
echo -e "\n1️⃣ Creating custom data source..."
RESPONSE=$(curl -s -X POST "$API_URL/admin/custom-data-sources" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "name": "Test Docker Source",
    "scraperConfiguration": {
      "url": "https://steamcommunity.com/market/priceoverview/?appid=730&currency=1&market_hash_name=AK-47%20%7C%20Redline%20%28Field-Tested%29",
      "selector": "lowest_price",
      "mode": "instant"
    }
  }')

SOURCE_ID=$(echo $RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "Created source with ID: $SOURCE_ID"

# Test 2: Test scraper
echo -e "\n2️⃣ Testing scraper..."
curl -s -X POST "$API_URL/admin/custom-data-sources/$SOURCE_ID/test" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq .

# Test 3: List sources
echo -e "\n3️⃣ Listing all sources..."
curl -s -X GET "$API_URL/admin/custom-data-sources" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq 'length'

echo -e "\n✅ Tests completed!"
```

Make executable and run:
```bash
chmod +x docker-test.sh
./docker-test.sh
```

## Troubleshooting

### Container Won't Start

```bash
# Check container status
docker compose -f docker/docker-compose.build.yml ps

# View detailed logs
docker compose -f docker/docker-compose.build.yml logs ghostfolio

# Check for database connection issues
docker compose -f docker/docker-compose.build.yml logs postgres
```

### Migration Issues

```bash
# Stop all services
docker compose -f docker/docker-compose.build.yml down

# Remove volumes (WARNING: deletes all data)
docker compose -f docker/docker-compose.build.yml down -v

# Rebuild and restart
docker compose -f docker/docker-compose.build.yml build
docker compose -f docker/docker-compose.build.yml up -d
```

### Port Already in Use

```bash
# Check what's using port 3333
lsof -i :3333  # On Linux/Mac
netstat -ano | findstr :3333  # On Windows

# Stop the conflicting service or change port in docker-compose.yml
```

### Authentication Errors

- Ensure your token is valid and not expired
- Verify you're using the ADMIN user (first user created)
- Check if token is properly formatted in the Authorization header

### Cannot Connect to API

```bash
# Verify containers are running
docker compose -f docker/docker-compose.build.yml ps

# Check if port is exposed
docker port ghostfolio 3333

# Test basic connectivity
curl http://localhost:3333/api/v1/health
```

## Updating Your Code Changes

When you make code changes:

```bash
# Stop services
docker compose -f docker/docker-compose.build.yml down

# Rebuild with new changes
docker compose -f docker/docker-compose.build.yml build --no-cache

# Start services
docker compose -f docker/docker-compose.build.yml up -d

# Check logs
docker compose -f docker/docker-compose.build.yml logs -f ghostfolio
```

## Clean Up

```bash
# Stop all services
docker compose -f docker/docker-compose.build.yml down

# Remove volumes (database data)
docker compose -f docker/docker-compose.build.yml down -v

# Remove images
docker rmi ghostfolio/ghostfolio:local

# Complete cleanup
docker system prune -a --volumes
```

## Production Deployment

For production with your custom changes:

```bash
# Build production image
docker compose -f docker/docker-compose.build.yml build

# Tag for your registry
docker tag ghostfolio/ghostfolio:local your-registry/ghostfolio:custom

# Push to registry
docker push your-registry/ghostfolio:custom

# Deploy using standard docker-compose.yml with your custom image
```

## Quick Reference

```bash
# Start everything
docker compose -f docker/docker-compose.build.yml up -d

# View logs
docker compose -f docker/docker-compose.build.yml logs -f

# Stop everything
docker compose -f docker/docker-compose.build.yml down

# Rebuild after code changes
docker compose -f docker/docker-compose.build.yml build --no-cache

# Access database
docker exec -it gf-postgres-build psql -U user -d ghostfolio-db

# Health check
curl http://localhost:3333/api/v1/health
```

## Next Steps

After testing:
1. Create multiple custom data sources with different scrapers
2. Create assets using those sources via the web UI
3. Monitor the data gathering process in the logs
4. Test the export/import functionality
5. Verify portfolio calculations with custom assets

## Additional Resources

- Main documentation: `CUSTOM_DATA_SOURCES.md`
- API examples: `CUSTOM_DATA_SOURCES_EXAMPLES.md`
- Technical details: `IMPLEMENTATION_SUMMARY.md`
