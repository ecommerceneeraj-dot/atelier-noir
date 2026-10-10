import { getShopifyConfig, getStorefrontGraphQLEndpoint } from '../config/shopify';
import {
  CartLineItem,
  ClothingCategorySlug,
  ClothingGender,
  ClothingProduct,
  ProductColorOption,
  ProductVariant,
  StoreCart,
} from '../types/store';

/**
 * STRICT CLOTHING-ONLY GUARD:
 * Never sell or display shoes, sneakers, boots, footwear, or shoe accessories.
 */
const BANNED_FOOTWEAR_KEYWORDS = [
  'shoe',
  'shoes',
  'sneaker',
  'sneakers',
  'boot',
  'boots',
  'footwear',
  'sandal',
  'sandals',
  'loafer',
  'loafers',
  'heel',
  'heels',
  'slipper',
  'slippers',
  'shoelace',
  'insole',
  'mule',
  'mules',
  'trainer',
  'trainers',
];

export function isFootwearItem(product: {
  title?: string;
  productType?: string;
  tags?: string[];
  description?: string;
}): boolean {
  const combined = [
    product.title || '',
    product.productType || '',
    ...(product.tags || []),
  ]
    .join(' ')
    .toLowerCase();

  return BANNED_FOOTWEAR_KEYWORDS.some((kw) => {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    return regex.test(combined);
  });
}

function mapCategoryFromShopify(productType = '', tags: string[] = [], title = ''): {
  category: Exclude<ClothingCategorySlug, 'all-clothing' | 'new-arrivals'>;
  categoryLabel: string;
  silhouette: ClothingProduct['garment3DProfile']['silhouette'];
} {
  const hay = `${productType} ${tags.join(' ')} ${title}`.toLowerCase();
  if (hay.includes('co-ord') || hay.includes('coord') || hay.includes('set') || hay.includes('ensemble')) {
    return { category: 'co-ord-sets', categoryLabel: 'Co-ord Sets', silhouette: 'coord' };
  }
  if (hay.includes('hoodie') || hay.includes('sweatshirt') || hay.includes('fleece') || hay.includes('pullover')) {
    return { category: 'hoodies-sweatshirts', categoryLabel: 'Hoodies & Sweatshirts', silhouette: 'hoodie' };
  }
  if (hay.includes('jacket') || hay.includes('coat') || hay.includes('outerwear') || hay.includes('parka') || hay.includes('blazer')) {
    return { category: 'jackets', categoryLabel: 'Jackets & Outerwear', silhouette: 'jacket' };
  }
  if (hay.includes('trouser') || hay.includes('pant') || hay.includes('cargo') || hay.includes('jean') || hay.includes('denim')) {
    return { category: 'trousers', categoryLabel: 'Trousers', silhouette: 'trousers' };
  }
  if (hay.includes('shirt') && !hay.includes('t-shirt') && !hay.includes('tee') && !hay.includes('sweatshirt')) {
    return { category: 'shirts', categoryLabel: 'Shirts', silhouette: 'shirt' };
  }
  return { category: 't-shirts', categoryLabel: 'Oversized T-shirts', silhouette: 'tshirt' };
}

function mapGenderFromShopify(tags: string[] = []): ClothingGender {
  const joined = tags.join(' ').toLowerCase();
  if (joined.includes('women') || joined.includes('womens')) return 'Women';
  if (joined.includes('men') || joined.includes('mens')) return 'Men';
  return 'Unisex';
}

const COLOR_HEX_MAP: Record<string, string> = {
  black: '#121214',
  obsidian: '#121214',
  noir: '#121214',
  charcoal: '#2E3035',
  slate: '#3A3D42',
  grey: '#52525B',
  gray: '#52525B',
  silver: '#A1A1AA',
  white: '#F4F4F5',
  ivory: '#EFECE4',
  bone: '#E6E0D4',
  cream: '#EFECE4',
  chalk: '#EAE6DF',
  stone: '#D6D0C4',
  olive: '#3B4236',
  navy: '#1B2230',
  bronze: '#8A7356',
};

function inferHexFromColorName(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, hex] of Object.entries(COLOR_HEX_MAP)) {
    if (lower.includes(key)) return hex;
  }
  return '#27272A';
}

const PRODUCT_FRAGMENT = `
  id
  handle
  title
  description
  productType
  tags
  createdAt
  availableForSale
  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }
  }
  compareAtPriceRange {
    maxVariantPrice {
      amount
      currencyCode
    }
  }
  images(first: 8) {
    edges {
      node {
        url
        altText
      }
    }
  }
  options {
    name
    values
  }
  variants(first: 50) {
    edges {
      node {
        id
        title
        sku
        availableForSale
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
      }
    }
  }
`;

const CART_FRAGMENT = `
  id
  checkoutUrl
  cost {
    subtotalAmount {
      amount
      currencyCode
    }
  }
  lines(first: 50) {
    edges {
      node {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
            image {
              url
              altText
            }
            product {
              id
              handle
              title
              productType
            }
          }
        }
      }
    }
  }
`;

export interface StorefrontQueryResult<T> {
  data?: T;
  usedTokenless: boolean;
  error?: string;
}

export async function executeStorefrontGraphQL<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<StorefrontQueryResult<T>> {
  const config = getShopifyConfig();
  const endpoint = getStorefrontGraphQLEndpoint(config);

  if (!endpoint) {
    return {
      usedTokenless: false,
      error: 'Shopify store domain is not configured. Set VITE_SHOPIFY_STORE_DOMAIN or configure via the Storefront Setup panel.',
    };
  }

  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  // If no public token is provided, attempt tokenless Storefront API access first
  // as supported by Shopify for core public query/cart operations.
  const headersWithToken: Record<string, string> = config.publicStorefrontToken
    ? {
        ...baseHeaders,
        'X-Shopify-Storefront-Access-Token': config.publicStorefrontToken,
      }
    : baseHeaders;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headersWithToken,
      body: JSON.stringify({ query, variables }),
    });

    let json: {
      data?: T;
      errors?: { message?: string; extensions?: { code?: string } }[];
    } | null = null;

    try {
      json = await response.json();
    } catch {
      json = null;
    }

    if (json?.errors && Array.isArray(json.errors) && json.errors.length > 0) {
      const rawMessages = json.errors
        .map((e) => {
          const code = e.extensions?.code ? ` [${e.extensions.code}]` : '';
          return `${e.message || 'GraphQL error'}${code}`;
        })
        .join('; ');

      if (/online store channel is locked/i.test(rawMessages)) {
        return {
          usedTokenless: !config.publicStorefrontToken,
          error: `Shopify Storefront API HTTP ${response.status}: "${rawMessages}" — Tokenless Storefront API access is blocked by Shopify while the storefront password page is active on ${config.storeDomain}. Next Step: Either disable the storefront password in Shopify Admin (Online Store → Preferences → Password protection) for tokenless access, OR provide a Public Storefront Access Token (VITE_SHOPIFY_STOREFRONT_PUBLIC_TOKEN) from a Shopify Admin Custom App (Settings → Apps and sales channels → Develop apps).`,
        };
      }

      return {
        usedTokenless: !config.publicStorefrontToken,
        error: `Shopify Storefront GraphQL Error (HTTP ${response.status}): ${rawMessages}`,
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        usedTokenless: !config.publicStorefrontToken,
        error: config.publicStorefrontToken
          ? `Shopify Storefront API returned HTTP ${response.status} (Unauthorized). Verify that your Public Storefront API Token (VITE_SHOPIFY_STOREFRONT_PUBLIC_TOKEN) is valid and has unauthenticated_read_product_listings and unauthenticated_write_checkouts scopes.`
          : `Tokenless access returned HTTP ${response.status} on ${config.storeDomain}. Next Step: Provide a Public Storefront Access Token (VITE_SHOPIFY_STOREFRONT_PUBLIC_TOKEN) with unauthenticated_read_product_listings permissions.`,
      };
    }

    if (!response.ok) {
      return {
        usedTokenless: !config.publicStorefrontToken,
        error: `Shopify Storefront endpoint returned HTTP ${response.status} (${response.statusText}) on ${endpoint}. Verify the store domain (${config.storeDomain}) and API version (${config.storefrontApiVersion}).`,
      };
    }

    return {
      data: json?.data as T,
      usedTokenless: !config.publicStorefrontToken,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      usedTokenless: !config.publicStorefrontToken,
      error: `Network error connecting to ${endpoint}: ${message}. Check that the domain is a valid *.myshopify.com or custom Shopify storefront domain.`,
    };
  }
}

export interface ShopifyCollectionSummary {
  id: string;
  handle: string;
  title: string;
  description: string;
}

export async function fetchShopifyCollections(): Promise<{
  collections: ShopifyCollectionSummary[];
  usedTokenless: boolean;
  error?: string;
}> {
  const query = `
    query FetchStorefrontCollections {
      collections(first: 20) {
        edges {
          node {
            id
            handle
            title
            description
          }
        }
      }
    }
  `;

  const result = await executeStorefrontGraphQL<{
    collections: { edges: { node: ShopifyCollectionSummary }[] };
  }>(query);

  if (result.error || !result.data) {
    return {
      collections: [],
      usedTokenless: result.usedTokenless,
      error: result.error,
    };
  }

  return {
    collections: (result.data.collections?.edges || []).map((e) => e.node),
    usedTokenless: result.usedTokenless,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeShopifyProduct(node: any): ClothingProduct {
  const { category, categoryLabel, silhouette } = mapCategoryFromShopify(
    node.productType,
    node.tags || [],
    node.title
  );

  const minPrice = parseFloat(node.priceRange?.minVariantPrice?.amount || '0');
  const maxCompare = parseFloat(node.compareAtPriceRange?.maxVariantPrice?.amount || '0');
  const currencyCode = node.priceRange?.minVariantPrice?.currencyCode || 'INR';

  // Extract options
  const sizeSet = new Set<'XS' | 'S' | 'M' | 'L' | 'XL'>();
  const colorMap = new Map<string, ProductColorOption>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const variants: ProductVariant[] = (node.variants?.edges || []).map((edge: any) => {
    const v = edge.node;
    const opts = v.selectedOptions || [];
    const sizeOpt = opts.find((o: { name: string }) => /size/i.test(o.name))?.value || 'M';
    const colorOpt = opts.find((o: { name: string }) => /color|colour|shade/i.test(o.name))?.value || 'Obsidian Black';

    const normalizedSize = (['XS', 'S', 'M', 'L', 'XL'].includes(sizeOpt.toUpperCase())
      ? sizeOpt.toUpperCase()
      : 'M') as 'XS' | 'S' | 'M' | 'L' | 'XL';

    sizeSet.add(normalizedSize);
    if (!colorMap.has(colorOpt)) {
      colorMap.set(colorOpt, {
        name: colorOpt,
        hex: inferHexFromColorName(colorOpt),
      });
    }

    const vPrice = parseFloat(v.price?.amount || String(minPrice));
    const vCompare = v.compareAtPrice?.amount ? parseFloat(v.compareAtPrice.amount) : undefined;

    return {
      id: v.id,
      title: v.title,
      size: normalizedSize,
      color: colorOpt,
      price: vPrice,
      compareAtPrice: vCompare && vCompare > vPrice ? vCompare : undefined,
      currencyCode: v.price?.currencyCode || currencyCode,
      availableForSale: Boolean(v.availableForSale),
      sku: v.sku || undefined,
    };
  });

  if (colorMap.size === 0) {
    colorMap.set('Obsidian Black', { name: 'Obsidian Black', hex: '#121214' });
  }
  if (sizeSet.size === 0) {
    ['S', 'M', 'L'].forEach((s) => sizeSet.add(s as 'S' | 'M' | 'L'));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const images = (node.images?.edges || []).map((edge: any) => ({
    url: edge.node.url,
    altText: edge.node.altText || node.title,
  }));

  const colors = Array.from(colorMap.values());

  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    subtitle: node.productType || categoryLabel,
    description: node.description || '',
    category,
    categoryLabel,
    gender: mapGenderFromShopify(node.tags || []),
    isNewArrival: true,
    createdAt: node.createdAt || new Date().toISOString(),
    price: minPrice,
    compareAtPrice: maxCompare > minPrice ? maxCompare : undefined,
    currencyCode,
    availableForSale: Boolean(node.availableForSale),
    images,
    colors,
    sizes: Array.from(sizeSet),
    variants,
    garment3DProfile: {
      silhouette,
      primaryColorHex: colors[0]?.hex || '#18181B',
      fabricRoughness: 0.8,
      fabricMetalness: 0.05,
      gsmWeightLabel: 'Atelier Archive Grade',
    },
    source: 'shopify',
  };
}

export async function fetchShopifyCatalog(sortKey: 'BEST_SELLING' | 'CREATED_AT' | 'TITLE' = 'CREATED_AT'): Promise<{
  products: ClothingProduct[];
  filteredFootwearCount: number;
  usedTokenless: boolean;
  error?: string;
}> {
  const query = `
    query FetchClothingCatalog($sortKey: ProductSortKeys!) {
      products(first: 40, sortKey: $sortKey) {
        edges {
          node {
            ${PRODUCT_FRAGMENT}
          }
        }
      }
    }
  `;

  const result = await executeStorefrontGraphQL<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    products: { edges: { node: any }[] };
  }>(query, { sortKey });

  if (result.error || !result.data) {
    return {
      products: [],
      filteredFootwearCount: 0,
      usedTokenless: result.usedTokenless,
      error: result.error,
    };
  }

  const rawNodes = result.data.products.edges.map((e) => e.node);
  let filteredFootwearCount = 0;

  const clothingNodes = rawNodes.filter((node) => {
    if (isFootwearItem(node)) {
      filteredFootwearCount += 1;
      return false;
    }
    return true;
  });

  return {
    products: clothingNodes.map(normalizeShopifyProduct),
    filteredFootwearCount,
    usedTokenless: result.usedTokenless,
  };
}

export async function searchShopifyProducts(searchTerm: string): Promise<{
  products: ClothingProduct[];
  error?: string;
}> {
  const query = `
    query SearchClothingProducts($query: String!) {
      products(first: 24, query: $query) {
        edges {
          node {
            ${PRODUCT_FRAGMENT}
          }
        }
      }
    }
  `;

  const result = await executeStorefrontGraphQL<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    products: { edges: { node: any }[] };
  }>(query, { query: searchTerm });

  if (result.error || !result.data) {
    return { products: [], error: result.error };
  }

  const valid = result.data.products.edges
    .map((e) => e.node)
    .filter((node) => !isFootwearItem(node))
    .map(normalizeShopifyProduct);

  return { products: valid };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeShopifyCart(cartNode: any): StoreCart {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lines: CartLineItem[] = (cartNode.lines?.edges || []).map((edge: any) => {
    const node = edge.node;
    const merch = node.merchandise;
    const opts = merch?.selectedOptions || [];
    const size = opts.find((o: { name: string }) => /size/i.test(o.name))?.value || 'M';
    const color = opts.find((o: { name: string }) => /color|colour/i.test(o.name))?.value || 'Obsidian';

    return {
      id: node.id,
      variantId: merch.id,
      productId: merch.product?.id || '',
      productHandle: merch.product?.handle || '',
      title: merch.product?.title || merch.title,
      categoryLabel: merch.product?.productType || 'Clothing',
      size,
      color,
      quantity: node.quantity,
      price: parseFloat(merch.price?.amount || '0'),
      compareAtPrice: merch.compareAtPrice?.amount ? parseFloat(merch.compareAtPrice.amount) : undefined,
      currencyCode: merch.price?.currencyCode || 'INR',
      imageUrl: merch.image?.url || '',
    };
  });

  return {
    id: cartNode.id,
    lines,
    subtotalAmount: parseFloat(cartNode.cost?.subtotalAmount?.amount || '0'),
    currencyCode: cartNode.cost?.subtotalAmount?.currencyCode || 'INR',
    checkoutUrl: cartNode.checkoutUrl || null,
    source: 'shopify',
  };
}

export async function createShopifyCart(
  lines: { merchandiseId: string; quantity: number }[] = []
): Promise<{ cart?: StoreCart; error?: string }> {
  const mutation = `
    mutation CartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          ${CART_FRAGMENT}
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const result = await executeStorefrontGraphQL<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cartCreate: { cart: any; userErrors: { message: string }[] };
  }>(mutation, { input: { lines } });

  if (result.error || !result.data) {
    return { error: result.error };
  }

  const userErrors = result.data.cartCreate?.userErrors || [];
  if (userErrors.length > 0) {
    return { error: userErrors.map((u) => u.message).join('; ') };
  }

  return { cart: normalizeShopifyCart(result.data.cartCreate.cart) };
}

export async function addLinesToShopifyCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<{ cart?: StoreCart; error?: string }> {
  const mutation = `
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          ${CART_FRAGMENT}
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const result = await executeStorefrontGraphQL<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cartLinesAdd: { cart: any; userErrors: { message: string }[] };
  }>(mutation, { cartId, lines });

  if (result.error || !result.data) {
    return { error: result.error };
  }

  const userErrors = result.data.cartLinesAdd?.userErrors || [];
  if (userErrors.length > 0) {
    return { error: userErrors.map((u) => u.message).join('; ') };
  }

  return { cart: normalizeShopifyCart(result.data.cartLinesAdd.cart) };
}

export async function updateShopifyCartLines(
  cartId: string,
  lines: { id: string; quantity: number }[]
): Promise<{ cart?: StoreCart; error?: string }> {
  const mutation = `
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          ${CART_FRAGMENT}
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const result = await executeStorefrontGraphQL<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cartLinesUpdate: { cart: any; userErrors: { message: string }[] };
  }>(mutation, { cartId, lines });

  if (result.error || !result.data) {
    return { error: result.error };
  }

  const userErrors = result.data.cartLinesUpdate?.userErrors || [];
  if (userErrors.length > 0) {
    return { error: userErrors.map((u) => u.message).join('; ') };
  }

  return { cart: normalizeShopifyCart(result.data.cartLinesUpdate.cart) };
}

export async function removeShopifyCartLines(
  cartId: string,
  lineIds: string[]
): Promise<{ cart?: StoreCart; error?: string }> {
  const mutation = `
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          ${CART_FRAGMENT}
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const result = await executeStorefrontGraphQL<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cartLinesRemove: { cart: any; userErrors: { message: string }[] };
  }>(mutation, { cartId, lineIds });

  if (result.error || !result.data) {
    return { error: result.error };
  }

  const userErrors = result.data.cartLinesRemove?.userErrors || [];
  if (userErrors.length > 0) {
    return { error: userErrors.map((u) => u.message).join('; ') };
  }

  return { cart: normalizeShopifyCart(result.data.cartLinesRemove.cart) };
}
