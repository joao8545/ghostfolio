# Testing Custom Data Sources Feature

This guide explains how to spin up and test the custom data sources feature locally.

## Prerequisites

Before you start, ensure you have:
- Docker and Docker Compose installed
- Node.js >= 22.18.0
- Git (to clone the repository)

## Quick Start (5 minutes)

### 1. Setup Environment

```bash
# Clone the repository (if not already done)
git clone https://github.com/joao8545/ghostfolio.git
cd ghostfolio

# Copy the environment file
cp .env.dev .env

# Install dependencies
npm install
```

### 2. Start Database Services

```bash
# Start PostgreSQL and Redis
docker compose -f docker/docker-compose.dev.yml up -d
```

This will start:
- PostgreSQL (database) on port 5432
- Redis (cache) on port 6379

### 3. Initialize Database

```bash
# Run migrations and seed data
npm run database:setup
```

This command:
- Creates the database schema (including the new `CustomDataSource` table)
- Runs the migration for custom data sources
- Seeds initial data

### 4. Start the Application

Open two terminal windows:

**Terminal 1 - Start the API server:**
```bash
npm run start:server
```

The API will be available at `http://localhost:3333`

**Terminal 2 - Start the client:**
```bash
npm run start:client
```

The client will open automatically at `https://localhost:4200/en`

### 5. Create Admin User

1. Open https://localhost:4200/en in your browser
2. Click "Get Started"
3. Create a new user (this first user will automatically get `ADMIN` role)

## Testing Custom Data Sources

### Option 1: Using the API (Recommended for Testing)

Once the server is running, you can test the custom data sources API using curl or any HTTP client.

#### 1. Get Your Authorization Token

After logging in to the web interface:
1. Open browser DevTools (F12)
2. Go to Application/Storage → Local Storage
3. Find and copy the `authToken` value

#### 2. Create a Test Custom Data Source

```bash
# Replace YOUR_AUTH_TOKEN with the actual token
curl -X POST http://localhost:3333/api/v1/admin/custom-data-sources \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "name": "Test Steam Market",
    "scraperConfiguration": {
      "url": "https://steamcommunity.com/market/priceoverview/?appid=730&currency=1&market_hash_name=AK-47%20%7C%20Redline%20%28Field-Tested%29",
      "selector": "lowest_price",
      "mode": "instant"
    }
  }'
```

Expected response:
```json
{
  "id": "uuid-here",
  "name": "Test Steam Market",
  "scraperConfiguration": {...},
  "userId": "your-user-id",
  "createdAt": "2026-01-29T...",
  "updatedAt": "2026-01-29T..."
}
```

#### 3. Test the Scraper

```bash
# Replace CUSTOM_SOURCE_ID with the ID from step 2
curl -X POST http://localhost:3333/api/v1/admin/custom-data-sources/CUSTOM_SOURCE_ID/test \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

Expected response:
```json
{
  "price": 10.50
}
```

#### 4. List Custom Data Sources

```bash
curl -X GET http://localhost:3333/api/v1/admin/custom-data-sources \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

#### 5. Create an Asset Using the Custom Source

Via the web interface:
1. Navigate to Admin Panel → Assets
2. Create a new asset with:
   - Symbol: `CSGO_AK47_REDLINE`
   - Name: `CS:GO AK-47 | Redline (Field-Tested)`
   - Data Source: `CUSTOM`
   - Custom Data Source ID: (paste the ID from step 2)
   - Currency: `USD`
   - Asset Class: `LIQUIDITY`

### Option 2: Using a Simple Test Script

Create a test file `test-custom-source.js`:

```javascript
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3333/api/v1';
const AUTH_TOKEN = 'YOUR_AUTH_TOKEN_HERE'; // Replace with your token

async function testCustomDataSource() {
  try {
    // 1. Create a custom data source
    console.log('Creating custom data source...');
    const createResponse = await fetch(`${API_BASE}/admin/custom-data-sources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify({
        name: 'Test Data Source',
        scraperConfiguration: {
          url: 'https://steamcommunity.com/market/priceoverview/?appid=730&currency=1&market_hash_name=AK-47%20%7C%20Redline%20%28Field-Tested%29',
          selector: 'lowest_price',
          mode: 'instant'
        }
      })
    });
    
    const customSource = await createResponse.json();
    console.log('Created:', customSource);
    
    // 2. Test the scraper
    console.log('\nTesting scraper...');
    const testResponse = await fetch(`${API_BASE}/admin/custom-data-sources/${customSource.id}/test`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    
    const testResult = await testResponse.json();
    console.log('Price fetched:', testResult);
    
    // 3. List all sources
    console.log('\nListing all sources...');
    const listResponse = await fetch(`${API_BASE}/admin/custom-data-sources`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    
    const sources = await listResponse.json();
    console.log('Total sources:', sources.length);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testCustomDataSource();
```

Run it:
```bash
node test-custom-source.js
```

## Testing Different Scraper Types

### HTML Scraping (CSS Selector)

```json
{
  "name": "HTML Scraper Example",
  "scraperConfiguration": {
    "url": "https://example.com/price-page",
    "selector": ".price-value",
    "locale": "en-US",
    "mode": "instant"
  }
}
```

### JSON API (JSONPath)

```json
{
  "name": "JSON API Example",
  "scraperConfiguration": {
    "url": "https://api.example.com/prices",
    "selector": "data.price",
    "mode": "instant"
  }
}
```

### Fixed Price

```json
{
  "name": "Fixed Price Example",
  "scraperConfiguration": {
    "defaultMarketPrice": 1000.00,
    "url": "",
    "selector": ""
  }
}
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if containers are running
docker ps

# View logs
docker compose -f docker/docker-compose.dev.yml logs

# Restart containers
docker compose -f docker/docker-compose.dev.yml restart
```

### Migration Issues

```bash
# Reset database (WARNING: deletes all data)
docker compose -f docker/docker-compose.dev.yml down -v
docker compose -f docker/docker-compose.dev.yml up -d
npm run database:setup
```

### Port Already in Use

If ports 3333, 4200, 5432, or 6379 are already in use:
```bash
# Find process using port
lsof -i :3333  # or :4200, :5432, :6379

# Kill process
kill -9 <PID>
```

### 403 Forbidden on API Calls

Make sure:
1. You're using the correct auth token
2. Your user has ADMIN role (first user created gets this automatically)
3. The token hasn't expired

## Viewing the Database

To inspect the database directly:

```bash
npm run database:gui
```

This opens Prisma Studio at http://localhost:5555 where you can:
- View all `CustomDataSource` records
- See `SymbolProfile` records with `customDataSourceId`
- Inspect relationships

## Running Tests

```bash
# Run API tests
npm run test:api

# Run specific test file
npm run test:single -- --test-file custom-data-source.service.spec.ts
```

## Clean Up

When you're done testing:

```bash
# Stop the application (Ctrl+C in both terminal windows)

# Stop Docker containers
docker compose -f docker/docker-compose.dev.yml down

# Optional: Remove volumes (deletes database data)
docker compose -f docker/docker-compose.dev.yml down -v
```

## Next Steps

After testing the API, you can:
1. Create multiple custom data sources
2. Create assets using those sources
3. Test the price fetching in the portfolio view
4. Check data gathering jobs
5. Test the export/import functionality with custom sources

## Need Help?

- Check the API logs in the server terminal
- Check browser console for client errors
- Review `CUSTOM_DATA_SOURCES.md` for feature documentation
- Review `CUSTOM_DATA_SOURCES_EXAMPLES.md` for more examples
