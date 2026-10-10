export interface ShopifyConfig {
  storeDomain: string;
  storefrontApiVersion: string;
  publicStorefrontToken: string;
}

const STORAGE_KEY = 'atelier_noir_shopify_runtime_config_v1';

function getStoredRuntimeConfig(): Partial<ShopifyConfig> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveRuntimeShopifyConfig(config: Partial<ShopifyConfig>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredRuntimeConfig();
    const updated = { ...current, ...config };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors in restricted environments
  }
}

export function clearRuntimeShopifyConfig(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function getShopifyConfig(): ShopifyConfig {
  const stored = getStoredRuntimeConfig();
  const envDomain = (import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || '8addqi-3d.myshopify.com').trim();
  const envVersion = (import.meta.env.VITE_SHOPIFY_STOREFRONT_API_VERSION || '2025-01').trim();
  const envToken = (import.meta.env.VITE_SHOPIFY_STOREFRONT_PUBLIC_TOKEN || '').trim();

  const rawDomain = (
    stored.storeDomain !== undefined && stored.storeDomain.trim() !== ''
      ? stored.storeDomain
      : envDomain
  ).trim();
  const normalizedDomain = rawDomain
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '');

  return {
    storeDomain: normalizedDomain,
    storefrontApiVersion: (stored.storefrontApiVersion || envVersion || '2025-01').trim(),
    publicStorefrontToken: (
      stored.publicStorefrontToken !== undefined ? stored.publicStorefrontToken : envToken
    ).trim(),
  };
}

export function getStorefrontGraphQLEndpoint(config = getShopifyConfig()): string {
  if (!config.storeDomain) return '';
  return `https://${config.storeDomain}/api/${config.storefrontApiVersion}/graphql.json`;
}
