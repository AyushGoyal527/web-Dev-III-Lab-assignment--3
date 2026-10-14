# Inventory & Data Management System

A small REST API for managing a shop or warehouse catalogue. Built with Node.js, Express, MongoDB and Mongoose for Web Dev III Lab Assignment 3.

## Features

- Create, view, update and delete products
- Mongoose field validation and unique SKU values
- Search, category and price filtering
- Sorting and pagination
- Safe stock restock/sale endpoint (sales cannot make stock negative)
- Low-stock report
- Category summary using a MongoDB aggregation pipeline
- Centralized error handling and environment-based configuration

## Requirements

- Node.js 18+
- MongoDB running locally, or a MongoDB Atlas connection string

## Run locally

1. Open this project folder in VS Code.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and update `MONGODB_URI` if needed.

   **Windows PowerShell:**
   ```powershell
   Copy-Item .env.example .env
   ```

4. Make sure MongoDB is running.
5. Start the server:

   ```bash
   npm run dev
   ```

6. Visit `http://localhost:5000/`. The root route shows the available endpoint paths.

## API reference

Base URL: `http://localhost:5000`

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/products` | Create a product |
| `GET` | `/api/products` | List products |
| `GET` | `/api/products/:id` | Get one product |
| `PUT` | `/api/products/:id` | Update product details |
| `PATCH` | `/api/products/:id/stock` | Restock or record a sale |
| `DELETE` | `/api/products/:id` | Delete a product |
| `GET` | `/api/reports/low-stock` | List low-stock products |
| `GET` | `/api/reports/category-summary` | Category-level inventory totals |

### Create product

`POST /api/products` with JSON body:

```json
{
  "name": "Wireless Mouse",
  "sku": "ACC-MOUSE-01",
  "category": "Accessories",
  "description": "Compact wireless mouse",
  "price": 799,
  "quantity": 12,
  "supplier": "Northside Supplies"
}
```

### List, search and filter

- `GET /api/products?page=1&limit=10`
- `GET /api/products?search=mouse`
- `GET /api/products?category=Accessories`
- `GET /api/products?minPrice=100&maxPrice=1000`
- `GET /api/products?sort=-price`
- `GET /api/products?sort=name&page=2&limit=5`

Sort values include `newest`, `oldest`, `name`, `-name`, `price`, `-price`, `quantity`, and `-quantity`.

### Adjust stock

`PATCH /api/products/:id/stock`

Restock:
```json
{ "operation": "restock", "quantity": 5 }
```

Sale:
```json
{ "operation": "sale", "quantity": 2 }
```

If a sale requests more than the available quantity, the API responds with `409 Conflict` and leaves stock unchanged.

### Reports

- `GET /api/reports/low-stock` (threshold defaults to `LOW_STOCK_THRESHOLD`, or `5`)
- `GET /api/reports/low-stock?threshold=10`
- `GET /api/reports/category-summary`

The category summary returns product count, total units, inventory value (`price × quantity`) and average product price for each category.

## Suggested test order

1. Create two or three products with different categories.
2. List products, then try search/filter/sort/pagination.
3. Open a product by its returned `_id`, update it, then delete a test item.
4. Try a restock and a sale. Try selling more than the available stock to confirm the safety check.
5. Check both report endpoints.

## Notes

This is a backend-only assignment, as requested by the lab brief; it does not include an admin panel or frontend framework. Do not commit your real `.env` file to GitHub.
