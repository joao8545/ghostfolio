# Custom Data Source Examples

This document provides practical examples of creating and using custom data sources in Ghostfolio.

## Example 1: Magic: The Gathering Cards from Card Market

### Step 1: Create the Custom Data Source

```bash
curl -X POST http://localhost:3333/api/v1/admin/custom-data-sources \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Card Market MTG",
    "scraperConfiguration": {
      "url": "https://www.cardmarket.com/en/Magic/Products/Singles/Dominaria/Teferi-Hero-of-Dominaria",
      "selector": ".price-value",
      "locale": "en-US",
      "mode": "instant"
    }
  }'
```

### Step 2: Test the Scraper

```bash
curl -X POST http://localhost:3333/api/v1/admin/custom-data-sources/CUSTOM_SOURCE_ID/test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response:
```json
{
  "price": 15.99
}
```

### Step 3: Create an Asset Using the Custom Data Source

When creating a custom asset, use `dataSource: "CUSTOM"` and reference your custom data source:

```json
{
  "symbol": "TEFERI_HERO",
  "name": "Teferi, Hero of Dominaria",
  "dataSource": "CUSTOM",
  "customDataSourceId": "CUSTOM_SOURCE_ID",
  "currency": "EUR",
  "assetClass": "LIQUIDITY",
  "assetSubClass": "COLLECTIBLE"
}
```

## Example 2: Brazilian Investment Fund via JSON API

### Create Custom Data Source for Brazilian Funds

```bash
curl -X POST http://localhost:3333/api/v1/admin/custom-data-sources \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Brazilian Funds API",
    "scraperConfiguration": {
      "url": "https://api.example.com.br/fundos/12345678",
      "selector": "data.valor_cota",
      "locale": "pt-BR",
      "mode": "lazy",
      "headers": {
        "Authorization": "Bearer API_TOKEN"
      }
    }
  }'
```

### Create Asset

```json
{
  "symbol": "FUND_XYZ",
  "name": "Fundo Multimercado XYZ",
  "dataSource": "CUSTOM",
  "customDataSourceId": "BRAZILIAN_FUNDS_ID",
  "currency": "BRL",
  "assetClass": "LIQUIDITY"
}
```

## Example 3: CS:GO Skins from Steam Market

### Create Custom Data Source

```bash
curl -X POST http://localhost:3333/api/v1/admin/custom-data-sources \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Steam Market",
    "scraperConfiguration": {
      "url": "https://steamcommunity.com/market/priceoverview/?appid=730&currency=1&market_hash_name=AK-47%20%7C%20Redline%20%28Field-Tested%29",
      "selector": "lowest_price",
      "mode": "instant"
    }
  }'
```

### Test Response

The Steam API returns JSON like:
```json
{
  "success": true,
  "lowest_price": "$10.50",
  "volume": "500",
  "median_price": "$11.00"
}
```

The selector `lowest_price` will extract `"$10.50"`, which will be parsed to `10.50`.

## Example 4: Fixed-Price Collectible

For assets with a known, fixed value:

```bash
curl -X POST http://localhost:3333/api/v1/admin/custom-data-sources \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Fixed Price Collectibles",
    "scraperConfiguration": {
      "defaultMarketPrice": 1000.00,
      "url": "",
      "selector": ""
    }
  }'
```

This is useful for:
- Art pieces with insurance valuations
- Real estate properties
- Vintage collectibles with appraisal values

## Example 5: Brazilian Bonds (Tesouro Direto)

```bash
curl -X POST http://localhost:3333/api/v1/admin/custom-data-sources \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Tesouro Direto",
    "scraperConfiguration": {
      "url": "https://www.tesourodireto.com.br/json/br/com/b3/tesourodireto/service/api/treasurybondsinfo.json",
      "selector": "response.TrsrBdTradgList[0].TrsrBd.BalPrice",
      "locale": "pt-BR",
      "mode": "lazy"
    }
  }'
```

## Managing Custom Data Sources

### List All Custom Data Sources

```bash
curl -X GET http://localhost:3333/api/v1/admin/custom-data-sources \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update a Custom Data Source

```bash
curl -X PATCH http://localhost:3333/api/v1/admin/custom-data-sources/CUSTOM_SOURCE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Updated Name",
    "scraperConfiguration": {
      "url": "https://new-url.com",
      "selector": ".new-selector"
    }
  }'
```

### Delete a Custom Data Source

```bash
curl -X DELETE http://localhost:3333/api/v1/admin/custom-data-sources/CUSTOM_SOURCE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Note: Deleting a custom data source will set the `customDataSourceId` to `null` for all associated assets, but the assets themselves will not be deleted.

## Tips and Best Practices

1. **Test First**: Always test your scraper configuration using the test endpoint before creating assets
2. **Use Lazy Mode**: For assets you check infrequently, use `mode: "lazy"` to avoid rate limiting
3. **Handle Multiple Assets**: Create one custom data source template and reuse it for multiple similar assets
4. **Locale Matters**: Specify the correct locale for proper number parsing (especially for currencies)
5. **Headers**: Some websites require specific headers (User-Agent, Authorization) to work properly
6. **Rate Limiting**: Be mindful of API rate limits when using `mode: "instant"`
7. **JSON APIs**: Prefer JSON APIs over HTML scraping when available for better reliability

## Troubleshooting

### Price Not Parsing Correctly

Check your locale setting. For example:
- US format: `1,234.56` → locale: `en-US`
- European format: `1.234,56` → locale: `de-DE`
- Brazilian format: `1.234,56` → locale: `pt-BR`

### 403 Forbidden Errors

Add appropriate headers:
```json
{
  "headers": {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
  }
}
```

### Timeout Errors

The scraper times out after the configured `REQUEST_TIMEOUT`. If a website is slow:
1. Use `mode: "lazy"` instead of `mode: "instant"`
2. Consider caching the data externally
3. Use a faster API if available
