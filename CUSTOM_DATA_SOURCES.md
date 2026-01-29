# Custom Data Sources

This feature allows you to create custom data sources for scraping asset prices from arbitrary websites or APIs. This is particularly useful for tracking assets that are not supported by standard data providers like Yahoo Finance or CoinGecko.

## Overview

Custom data sources enable you to create "template" scrapers that can be reused by multiple assets. For example, you can create a custom data source for:

- **Card Market** for Magic: The Gathering cards
- **LigaMagic** for MTG cards in Brazil
- **Steam Market** for CS:GO skins
- **Brazilian Investment Funds** (fundos multimercado)
- **Brazilian Bonds** (tesouro direto)
- Any other website or API that provides asset prices

## How It Works

### 1. Create a Custom Data Source

A custom data source consists of:
- **Name**: A unique identifier for the data source
- **Scraper Configuration**: Instructions on how to fetch and parse the price data

### 2. Scraper Configuration

The scraper configuration supports two types of sources:

#### HTML Scraping
For websites that display prices in HTML:
```json
{
  "url": "https://example.com/price-page",
  "selector": ".price-value",
  "headers": {
    "User-Agent": "Mozilla/5.0..."
  },
  "locale": "en-US",
  "mode": "instant"
}
```

#### JSON API
For APIs that return JSON data:
```json
{
  "url": "https://api.example.com/prices",
  "selector": "data.price",
  "headers": {
    "Authorization": "Bearer YOUR_TOKEN"
  },
  "mode": "instant"
}
```

#### Static Price
For assets with a fixed price:
```json
{
  "defaultMarketPrice": 100.00,
  "url": "",
  "selector": ""
}
```

### 3. Configuration Options

- **url** (required for dynamic prices): The URL to fetch the price from
- **selector** (required for dynamic prices): 
  - For HTML: CSS selector (e.g., `.price`, `#value`)
  - For JSON: JSONPath expression (e.g., `data.price`, `items[0].value`)
- **headers** (optional): Custom HTTP headers for the request
- **locale** (optional): Locale for parsing numbers (e.g., `en-US`, `pt-BR`)
- **mode** (optional): 
  - `instant`: Fetch price on every request
  - `lazy`: Use cached price (default)
- **defaultMarketPrice** (optional): Fixed price for the asset

## API Endpoints

### List Custom Data Sources
```
GET /api/v1/admin/custom-data-sources
```

### Get Custom Data Source
```
GET /api/v1/admin/custom-data-sources/:id
```

### Create Custom Data Source
```
POST /api/v1/admin/custom-data-sources
Content-Type: application/json

{
  "name": "Card Market",
  "scraperConfiguration": {
    "url": "https://www.cardmarket.com/en/Magic/Products/Singles/...",
    "selector": ".price-value",
    "mode": "instant"
  }
}
```

### Update Custom Data Source
```
PATCH /api/v1/admin/custom-data-sources/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "scraperConfiguration": { ... }
}
```

### Delete Custom Data Source
```
DELETE /api/v1/admin/custom-data-sources/:id
```

### Test Custom Data Source
```
POST /api/v1/admin/custom-data-sources/:id/test
```
Returns the current price fetched using the scraper configuration.

## Using Custom Data Sources

### 1. Create a Custom Data Source
First, create the custom data source using the admin API.

### 2. Create Asset with Custom Data Source
When creating a custom asset:
1. Set `dataSource` to `CUSTOM`
2. Set `customDataSourceId` to the ID of your custom data source
3. The asset will use the scraper configuration from the custom data source

### 3. Asset-Specific Overrides
You can still provide asset-specific scraper configurations in the `scraperConfiguration` field of the asset if needed. The custom data source configuration serves as a template, and asset-specific configurations can override it.

## Example Use Cases

### Magic: The Gathering Card
```json
{
  "name": "Card Market MTG",
  "scraperConfiguration": {
    "url": "https://www.cardmarket.com/en/Magic/Products/Singles/...",
    "selector": ".price-value",
    "locale": "en-US",
    "mode": "instant"
  }
}
```

### Steam Market Item
```json
{
  "name": "Steam Market",
  "scraperConfiguration": {
    "url": "https://steamcommunity.com/market/priceoverview/?appid=730&currency=1&market_hash_name=...",
    "selector": "lowest_price",
    "mode": "instant"
  }
}
```

### Brazilian Investment Fund
```json
{
  "name": "Brazilian Funds",
  "scraperConfiguration": {
    "url": "https://api.example.com.br/fundos/...",
    "selector": "data.valor_cota",
    "locale": "pt-BR",
    "mode": "lazy"
  }
}
```

## Security Considerations

- Custom data sources require admin permissions
- Be careful with API keys and tokens in headers
- Consider rate limiting when using `mode: "instant"`
- Validate scraper configurations before saving

## Limitations

- Scrapers must complete within the configured request timeout
- Complex JavaScript-rendered pages may not work (requires static HTML or JSON APIs)
- Some websites may block automated scraping
