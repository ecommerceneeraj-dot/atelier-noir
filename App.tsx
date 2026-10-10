/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  User,
  ShoppingBag,
  Menu,
  X,
} from 'lucide-react';
import { BRAND_CONFIG } from './config/brand';
import { DEVELOPMENT_CLOTHING_PRODUCTS } from './data/developmentCatalog';
import {
  ClothingCategorySlug,
  ClothingGender,
  ClothingProduct,
  ShopifyDiagnostics,
  StoreCart,
} from './types/store';
import { isFootwearItem } from './services/shopifyStorefront';
import { HomeView } from './views/HomeView';
import { CatalogueView } from './views/CatalogueView';
import { ProductDetailView } from './views/ProductDetailView';
import { CartPageView } from './views/CartPageView';
import { CartDrawer } from './components/CartDrawer';
import { SizeGuideModal } from './components/SizeGuideModal';
import { SearchOverlay } from './components/SearchOverlay';
import {
  PolicyAndAccountModal,
  PolicyModalType,
} from './components/PolicyAndAccountModal';

type ActiveRoute =
  | { page: 'home' }
  | { page: 'catalogue'; category: ClothingCategorySlug; gender: ClothingGender | 'All' }
  | { page: 'product'; handle: string }
  | { page: 'cart' };

const DEV_CART_STORAGE_KEY = 'atelier_noir_dev_cart_v1';
const WISHLIST_STORAGE_KEY = 'atelier_noir_wishlist_v1';

export default function App() {
  // Navigation & Route State
  const [route, setRoute] = useState<ActiveRoute>({ page: 'home' });
  const [announcementVisible, setAnnouncementVisible] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Modals & Drawers
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cartDrawerOpen, setCartDrawerOpen] = useState<boolean>(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState<boolean>(false);
  const [policyModal, setPolicyModal] = useState<PolicyModalType>(null);

  // Local Preview Sample Clothing Catalog (Strictly clothing-only, zero footwear)
  const products = useMemo<ClothingProduct[]>(
    () => DEVELOPMENT_CLOTHING_PRODUCTS.filter((p) => !isFootwearItem(p)),
    []
  );

  const diagnostics = useMemo<ShopifyDiagnostics>(
    () => ({
      mode: 'unconfigured',
      storeDomain: '',
      apiVersion: '2025-01',
      endpoint: '',
      hasPublicToken: false,
      lastCheckedAt: null,
      statusMessage: 'Design Preview Mode — Local Preview Sample Catalogue Active.',
      productsLoadedCount: products.length,
      filteredFootwearCount: 0,
    }),
    [products.length]
  );

  // Wishlist State (Persistent in localStorage)
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['dev-prod-01', 'dev-prod-03'];
    } catch {
      return ['dev-prod-01'];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch {
      // Ignore storage error
    }
  }, [wishlistIds]);

  const handleToggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlistIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Demo Cart State (Persistent in localStorage)
  const [cart, setCart] = useState<StoreCart>(() => {
    try {
      const raw = window.localStorage.getItem(DEV_CART_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // Ignore
    }
    return {
      id: 'preview-sample-cart',
      lines: [],
      subtotalAmount: 0,
      currencyCode: BRAND_CONFIG.currencyCode,
      checkoutUrl: null,
      source: 'development_catalog',
    };
  });
  const [isUpdatingCart, setIsUpdatingCart] = useState<boolean>(false);
  const [cartError, setCartError] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(DEV_CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore
    }
  }, [cart]);

  // Local Demo Cart Operations
  const handleAddToCart = async (
    variantId: string,
    quantity: number,
    openDrawer = true
  ) => {
    setCartError(null);
    setIsUpdatingCart(true);

    const matchedProduct = products.find((p) =>
      p.variants.some((v) => v.id === variantId)
    );
    const matchedVariant = matchedProduct?.variants.find((v) => v.id === variantId);

    if (!matchedProduct || !matchedVariant) {
      setCartError('Selected clothing variant could not be found.');
      setIsUpdatingCart(false);
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.lines.findIndex((l) => l.variantId === variantId);
      const nextLines = [...prev.lines];

      if (existingIndex >= 0) {
        const current = nextLines[existingIndex];
        nextLines[existingIndex] = {
          ...current,
          quantity: current.quantity + quantity,
        };
      } else {
        nextLines.push({
          id: `line-${variantId}`,
          variantId,
          productId: matchedProduct.id,
          productHandle: matchedProduct.handle,
          title: matchedProduct.title,
          categoryLabel: matchedProduct.categoryLabel,
          size: matchedVariant.size,
          color: matchedVariant.color,
          quantity,
          price: matchedVariant.price,
          compareAtPrice: matchedVariant.compareAtPrice,
          currencyCode: matchedVariant.currencyCode,
          imageUrl: matchedProduct.images[0]?.url || '',
        });
      }

      const subtotalAmount = nextLines.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      return {
        id: 'preview-sample-cart',
        lines: nextLines,
        subtotalAmount,
        currencyCode: matchedVariant.currencyCode,
        checkoutUrl: null,
        source: 'development_catalog',
      };
    });

    setIsUpdatingCart(false);
    if (openDrawer) setCartDrawerOpen(true);
  };

  const handleQuickAdd = (
    product: ClothingProduct,
    size: 'XS' | 'S' | 'M' | 'L' | 'XL',
    colorName: string
  ) => {
    const variant =
      product.variants.find((v) => v.size === size && v.color === colorName) ||
      product.variants.find((v) => v.size === size) ||
      product.variants[0];

    if (variant && variant.availableForSale) {
      handleAddToCart(variant.id, 1, true);
    }
  };

  const handleUpdateCartQuantity = async (lineId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await handleRemoveCartLine(lineId);
      return;
    }

    setCartError(null);
    setIsUpdatingCart(true);

    setCart((prev) => {
      const nextLines = prev.lines.map((line) =>
        line.id === lineId ? { ...line, quantity: newQuantity } : line
      );
      const subtotalAmount = nextLines.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      return { ...prev, lines: nextLines, subtotalAmount };
    });
    setIsUpdatingCart(false);
  };

  const handleRemoveCartLine = async (lineId: string) => {
    setCartError(null);
    setIsUpdatingCart(true);

    setCart((prev) => {
      const nextLines = prev.lines.filter((line) => line.id !== lineId);
      const subtotalAmount = nextLines.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      return { ...prev, lines: nextLines, subtotalAmount };
    });
    setIsUpdatingCart(false);
  };

  // Navigation Helpers
  const navigateToCategory = (
    category: ClothingCategorySlug,
    gender: ClothingGender | 'All' = 'All'
  ) => {
    setRoute({ page: 'catalogue', category, gender });
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToProduct = (handle: string) => {
    setRoute({ page: 'product', handle });
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalBagQuantity = cart.lines.reduce((sum, item) => sum + item.quantity, 0);

  // Search Overlay Results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return products.slice(0, 4);
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const wishlistedProducts = useMemo(
    () => products.filter((p) => wishlistIds.includes(p.id)),
    [products, wishlistIds]
  );

  const activeProduct =
    route.page === 'product'
      ? products.find((p) => p.handle === route.handle) || products[0]
      : null;

  const relatedProducts = useMemo(() => {
    if (!activeProduct) return [];
    return products.filter(
      (p) => p.id !== activeProduct.id && p.category === activeProduct.category
    );
  }, [products, activeProduct]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0B0C] text-[#F5F2EB] selection:bg-[#C5A880] selection:text-[#0B0B0C]">
      {/* A. ANNOUNCEMENT BAR (Slim <= 40px, dismissible) */}
      {announcementVisible && (
        <div className="h-9 bg-[#141417] border-b border-white/10 px-4 sm:px-8 flex items-center justify-between text-[11px] tracking-[0.14em] uppercase text-[#F5F2EB]">
          <div className="hidden md:block text-[#9A9A9E] truncate">
            {BRAND_CONFIG.announcementMessage}
          </div>
          <div className="mx-auto md:mx-0 text-center truncate text-[#C5A880] font-medium">
            {BRAND_CONFIG.shippingAnnouncement}
          </div>
          <button
            type="button"
            onClick={() => setAnnouncementVisible(false)}
            aria-label="Close announcement bar"
            className="ml-4 text-[#9A9A9E] hover:text-[#F5F2EB] p-1 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* B. PREMIUM NAVIGATION (Strict 3-Zone Top Bar Contract) */}
      <header className="sticky top-0 z-40 h-16 bg-[#0B0B0C]/90 backdrop-blur-md border-b border-white/10 px-6 sm:px-10 lg:px-14 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element Brand Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setRoute({ page: 'home' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="font-display text-lg sm:text-xl font-bold tracking-[0.22em] text-[#F5F2EB] whitespace-nowrap shrink-0"
        >
          {BRAND_CONFIG.name}
        </a>

        {/* Zone 2: 5 Concise Single-Line Navigation Links */}
        <nav
          aria-label="Primary Clothing Navigation"
          className="hidden lg:flex items-center gap-7 text-xs uppercase tracking-[0.16em] text-[#9A9A9E]"
        >
          <button
            type="button"
            onClick={() => navigateToCategory('new-arrivals', 'All')}
            className={`hover:text-[#F5F2EB] transition-colors whitespace-nowrap shrink-0 py-1 ${
              route.page === 'catalogue' && route.category === 'new-arrivals'
                ? 'text-[#C5A880] border-b border-[#C5A880]'
                : ''
            }`}
          >
            New Arrivals
          </button>
          <button
            type="button"
            onClick={() => navigateToCategory('all-clothing', 'All')}
            className={`hover:text-[#F5F2EB] transition-colors whitespace-nowrap shrink-0 py-1 ${
              route.page === 'catalogue' &&
              route.category === 'all-clothing' &&
              route.gender === 'All'
                ? 'text-[#C5A880] border-b border-[#C5A880]'
                : ''
            }`}
          >
            Clothing
          </button>
          <button
            type="button"
            onClick={() => navigateToCategory('all-clothing', 'Men')}
            className={`hover:text-[#F5F2EB] transition-colors whitespace-nowrap shrink-0 py-1 ${
              route.page === 'catalogue' && route.gender === 'Men'
                ? 'text-[#C5A880] border-b border-[#C5A880]'
                : ''
            }`}
          >
            Men
          </button>
          <button
            type="button"
            onClick={() => navigateToCategory('all-clothing', 'Women')}
            className={`hover:text-[#F5F2EB] transition-colors whitespace-nowrap shrink-0 py-1 ${
              route.page === 'catalogue' && route.gender === 'Women'
                ? 'text-[#C5A880] border-b border-[#C5A880]'
                : ''
            }`}
          >
            Women
          </button>
          <button
            type="button"
            onClick={() => navigateToCategory('co-ord-sets', 'All')}
            className={`hover:text-[#F5F2EB] transition-colors whitespace-nowrap shrink-0 py-1 ${
              route.page === 'catalogue' && route.category === 'co-ord-sets'
                ? 'text-[#C5A880] border-b border-[#C5A880]'
                : ''
            }`}
          >
            Collections
          </button>
        </nav>

        {/* Zone 3: Search, Account, and Shopping Bag with Live Cart Quantity */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search clothing"
            className="p-2 text-[#9A9A9E] hover:text-[#F5F2EB] transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setPolicyModal('account')}
            aria-label="Account and saved wishlist"
            className="p-2 text-[#9A9A9E] hover:text-[#F5F2EB] transition-colors relative"
          >
            <User className="w-4 h-4" />
            {wishlistIds.length > 0 && (
              <span className="sr-only">({wishlistIds.length} saved items)</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setCartDrawerOpen(true)}
            aria-label={`Shopping bag with ${totalBagQuantity} items`}
            className="px-3.5 py-2 bg-[#141417] hover:bg-[#C5A880] text-[#F5F2EB] hover:text-[#0B0B0C] border border-white/15 hover:border-[#C5A880] text-xs font-mono tabular-nums flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>BAG ({totalBagQuantity})</span>
          </button>

          {/* Mobile Hamburger Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            className="lg:hidden p-2 text-[#F5F2EB] border border-white/15"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-black/80 backdrop-blur-sm flex"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Clothing Menu"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-80 max-w-[85vw] bg-[#0B0B0C] border-r border-white/15 h-full p-6 flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-display text-lg tracking-[0.2em] text-[#F5F2EB]">
                  {BRAND_CONFIG.name}
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close mobile menu"
                  className="p-2 text-[#9A9A9E] hover:text-[#F5F2EB]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                <span className="block text-[10px] uppercase tracking-[0.2em] text-[#C5A880] mb-3">
                  Primary Sections
                </span>
                {(
                  [
                    { label: 'Home', action: () => setRoute({ page: 'home' }) },
                    {
                      label: 'New Arrivals',
                      action: () => navigateToCategory('new-arrivals', 'All'),
                    },
                    {
                      label: 'All Clothing',
                      action: () => navigateToCategory('all-clothing', 'All'),
                    },
                    { label: 'Men', action: () => navigateToCategory('all-clothing', 'Men') },
                    {
                      label: 'Women',
                      action: () => navigateToCategory('all-clothing', 'Women'),
                    },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      item.action();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-3 border-b border-white/[0.06] text-sm uppercase tracking-[0.15em] text-[#F5F2EB] hover:text-[#C5A880]"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <span className="block text-[10px] uppercase tracking-[0.2em] text-[#C5A880] mb-3">
                  Clothing Categories
                </span>
                {(
                  [
                    { slug: 't-shirts', label: 'Oversized T-Shirts' },
                    { slug: 'hoodies-sweatshirts', label: 'Hoodies & Sweatshirts' },
                    { slug: 'jackets', label: 'Jackets & Outerwear' },
                    { slug: 'shirts', label: 'Architectural Shirts' },
                    { slug: 'trousers', label: 'Tailored Trousers' },
                    { slug: 'co-ord-sets', label: 'Co-ord Sets' },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => navigateToCategory(cat.slug, 'All')}
                    className="w-full text-left py-2.5 text-xs uppercase tracking-[0.14em] text-[#9A9A9E] hover:text-[#F5F2EB]"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 text-[11px] text-[#9A9A9E]">
              <span>Design Preview Mode · Preview Sample Catalogue</span>
            </div>
          </div>
        </div>
      )}

      {/* MAIN VIEWPORT CONTENT */}
      <main id="top" className="flex-1">
        {route.page === 'home' && (
          <HomeView
            products={products}
            bestSellerProducts={[]}
            diagnostics={diagnostics}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onSelectCategory={(slug) => navigateToCategory(slug, 'All')}
            onSelectProduct={navigateToProduct}
            onQuickAdd={handleQuickAdd}
            onOpenShopifySetup={() => {}}
          />
        )}

        {route.page === 'catalogue' && (
          <CatalogueView
            activeCategory={route.category}
            activeGenderFilter={route.gender}
            searchQuery={searchQuery}
            products={products}
            wishlistIds={wishlistIds}
            onSelectCategory={(slug) =>
              setRoute({ page: 'catalogue', category: slug, gender: route.gender })
            }
            onSelectGender={(gender) =>
              setRoute({ page: 'catalogue', category: route.category, gender })
            }
            onClearSearch={() => setSearchQuery('')}
            onToggleWishlist={handleToggleWishlist}
            onSelectProduct={navigateToProduct}
            onQuickAdd={handleQuickAdd}
          />
        )}

        {route.page === 'product' && activeProduct && (
          <ProductDetailView
            product={activeProduct}
            relatedProducts={relatedProducts}
            cart={cart}
            wishlistIds={wishlistIds}
            onBack={() => navigateToCategory(activeProduct.category, 'All')}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onOpenSizeGuide={() => setSizeGuideOpen(true)}
            onOpenShopifySetup={() => {}}
            onSelectProduct={navigateToProduct}
            onQuickAdd={handleQuickAdd}
          />
        )}

        {route.page === 'cart' && (
          <CartPageView
            cart={cart}
            isUpdating={isUpdatingCart}
            cartError={cartError}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveLine={handleRemoveCartLine}
            onContinueShopping={() => navigateToCategory('all-clothing', 'All')}
            onOpenShopifySetup={() => {}}
            onSelectProduct={navigateToProduct}
          />
        )}
      </main>

      {/* J. FOOTER */}
      <footer className="bg-[#0B0B0C] border-t border-white/10 pt-16 pb-12 px-6 sm:px-10 lg:px-14">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-14 border-b border-white/10">
          {/* Column 1: Brand Identity */}
          <div className="lg:col-span-2 space-y-4">
            <span className="font-display text-2xl tracking-[0.22em] text-[#F5F2EB] block">
              {BRAND_CONFIG.name}
            </span>
            <p className="text-xs text-[#9A9A9E] max-w-sm leading-relaxed">
              {BRAND_CONFIG.tagline}. Architectural clothing crafted from heavyweight organic jersey, loopback French terry, and Italian virgin wool. Strictly clothing — zero footwear.
            </p>
            <p className="text-xs font-mono text-[#9A9A9E]">
              {BRAND_CONFIG.atelierLocation}
            </p>
          </div>

          {/* Column 2: Shop Clothing Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#F5F2EB]">
              Shop Clothing
            </h3>
            <ul className="space-y-2 text-xs text-[#9A9A9E]">
              {(
                [
                  { slug: 'all-clothing', label: 'All Clothing' },
                  { slug: 'new-arrivals', label: 'New Arrivals' },
                  { slug: 't-shirts', label: 'Oversized T-Shirts' },
                  { slug: 'hoodies-sweatshirts', label: 'Hoodies & Sweatshirts' },
                  { slug: 'jackets', label: 'Jackets & Outerwear' },
                  { slug: 'shirts', label: 'Architectural Shirts' },
                  { slug: 'trousers', label: 'Tailored Trousers' },
                  { slug: 'co-ord-sets', label: 'Co-ord Sets' },
                ] as const
              ).map((item) => (
                <li key={item.slug}>
                  <button
                    type="button"
                    onClick={() => navigateToCategory(item.slug, 'All')}
                    className="hover:text-[#C5A880] transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Client Services & Policies */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#F5F2EB]">
              Client Services
            </h3>
            <ul className="space-y-2 text-xs text-[#9A9A9E]">
              <li>
                <button
                  type="button"
                  onClick={() => setPolicyModal('contact')}
                  className="hover:text-[#C5A880] transition-colors"
                >
                  Contact Concierge
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setPolicyModal('shipping')}
                  className="hover:text-[#C5A880] transition-colors"
                >
                  Shipping Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setPolicyModal('returns')}
                  className="hover:text-[#C5A880] transition-colors"
                >
                  Returns & Exchanges Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="hover:text-[#C5A880] transition-colors"
                >
                  Garment Size Guide
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setPolicyModal('privacy')}
                  className="hover:text-[#C5A880] transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setPolicyModal('terms')}
                  className="hover:text-[#C5A880] transition-colors"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Editorial Channels */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#F5F2EB]">
              Editorial Channels
            </h3>
            <ul className="space-y-2 text-xs text-[#9A9A9E]">
              <li>
                <a
                  href={BRAND_CONFIG.socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#C5A880] transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={BRAND_CONFIG.socialLinks.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#C5A880] transition-colors"
                >
                  YouTube Editorial
                </a>
              </li>
              <li>
                <a
                  href={BRAND_CONFIG.socialLinks.pinterest}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#C5A880] transition-colors"
                >
                  Pinterest Archive
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9A9A9E]">
          <span>
            © {new Date().getFullYear()} {BRAND_CONFIG.name}. All rights reserved. Currency: {BRAND_CONFIG.currencyCode} ({BRAND_CONFIG.currencySymbol}).
          </span>
          <span>Clothing-Only Architectural Storefront · Design Preview Mode (Preview Sample Catalogue)</span>
        </div>
      </footer>

      {/* MODALS & DRAWERS */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cart={cart}
        isUpdating={isUpdatingCart}
        cartError={cartError}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveLine={handleRemoveCartLine}
        onViewFullCart={() => setRoute({ page: 'cart' })}
        onOpenShopifySetup={() => {}}
        onSelectProduct={navigateToProduct}
      />

      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        categoryLabel={activeProduct?.categoryLabel}
      />

      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        results={searchResults}
        onSelectProduct={navigateToProduct}
        onViewAllResults={() => navigateToCategory('all-clothing', 'All')}
      />

      <PolicyAndAccountModal
        activeModal={policyModal}
        onClose={() => setPolicyModal(null)}
        wishlistedProducts={wishlistedProducts}
        onSelectProduct={navigateToProduct}
        onRemoveWishlist={handleToggleWishlist}
        diagnostics={diagnostics}
        onOpenShopifySetup={() => {}}
      />
    </div>
  );
}
