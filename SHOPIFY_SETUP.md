# ATELIER NOIR — Shopify Storefront API Configuration & Verification Guide

This storefront is engineered to connect directly to any Shopify store using the official **Shopify Storefront GraphQL API** (`https://{shop}.myshopify.com/api/{version}/graphql.json`) **without requiring the Shopify Headless sales channel**.

---

## 1. Architecture & Security Guarantee

- **Clothing-Only Storefront Guard**: Both the Shopify GraphQL normalizer (`src/services/shopifyStorefront.ts`) and the catalog layer automatically inspect `title`, `productType`, and `tags` to filter out any footwear (`shoes`, `sneakers`, `boots`, `footwear`, `sandals`, `loafers`, `heels`, etc.).
- **Tokenless Storefront Access First**: When you provide only your `VITE_SHOPIFY_STORE_DOMAIN`, the service automatically attempts **Tokenless Storefront API access** first (which Shopify supports for public product queries, search, and cart mutations up to 1,000 variants).
- **Authenticated Public Storefront Token Support**: If your store requires a public token or has more than 1,000 variants, provide `VITE_SHOPIFY_STOREFRONT_PUBLIC_TOKEN`. The service attaches it via the `X-Shopify-Storefront-Access-Token` header.
- **Zero Secret Exposure**: Never place Shopify Admin API tokens (`shpat_...`) or private secret keys in frontend code or `.env` variables. Only public Storefront tokens (or tokenless access) are used for storefront operations.

---

## 2. How to Configure Your Real Shopify Store

### Option A: Via Environment Variables (`.env`)

Create or update your `.env` file in the root directory:

```env
VITE_SHOPIFY_STORE_DOMAIN="your-store-name.myshopify.com"
VITE_SHOPIFY_STOREFRONT_API_VERSION="2025-01"
VITE_SHOPIFY_STOREFRONT_PUBLIC_TOKEN=""
```

*(Or edit `src/config/shopify.ts` directly if you want hardcoded defaults).*

### Option B: Live In-App Configuration & Diagnostics

1. Click the **Shopify Setup** status bar or footer link in the application.
2. Enter your real `.myshopify.com` domain (and optional Public Storefront Token).
3. Click **Save & Verify Connection**.
4. The app will immediately test the GraphQL connection against `https://{your-domain}/api/2025-01/graphql.json` and load your live clothing catalogue and real Shopify cart checkout URL.

---

## 3. How to Generate a Public Storefront API Token (Without Headless Channel)

If tokenless access is disabled on your Shopify store, you can create a standard Custom App in under 60 seconds:

1. Log in to your **Shopify Admin**.
2. Navigate to **Settings → Apps and sales channels → Develop apps**.
3. Click **Create an app** and name it `Atelier Noir Storefront`.
4. Click **Configure Storefront API scopes** and check:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_checkouts`
5. Click **Save**, then **Install app**, and copy the **Storefront API access token** into `VITE_SHOPIFY_STOREFRONT_PUBLIC_TOKEN`.

---

## 4. Verifying the Connection

- When connected, the Storefront Diagnostics modal displays `Connected (Tokenless Public Storefront API)` or `Connected (Authenticated Public Storefront Token)`.
- Adding an item to the bag calls the `cartCreate` / `cartLinesAdd` GraphQL mutations and retrieves the official `cart.checkoutUrl` from Shopify.
- Clicking **Proceed to Shopify Checkout** or **Buy Now** redirects the customer directly to the real `checkoutUrl` returned by Shopify.
