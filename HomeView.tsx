import React, { useState } from 'react';
import { ArrowRight, Sparkles, SlidersHorizontal, CheckCircle2, AlertCircle } from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';
import {
  CATEGORY_META,
  IMG_EDITORIAL_BRUTALIST,
  IMG_HERO_CAMPAIGN,
  IMG_JACKET_OBSIDIAN,
} from '../data/developmentCatalog';
import {
  ClothingCategorySlug,
  ClothingProduct,
  ShopifyDiagnostics,
} from '../types/store';
import { Garment3DCanvas } from '../components/Garment3DCanvas';
import { ProductCard } from '../components/ProductCard';
import { ResilientImage } from '../components/ResilientImage';

interface HomeViewProps {
  products: ClothingProduct[];
  bestSellerProducts: ClothingProduct[];
  diagnostics: ShopifyDiagnostics;
  wishlistIds: string[];
  onToggleWishlist: (productId: string, e: React.MouseEvent) => void;
  onSelectCategory: (slug: ClothingCategorySlug) => void;
  onSelectProduct: (handle: string) => void;
  onQuickAdd: (
    product: ClothingProduct,
    size: 'XS' | 'S' | 'M' | 'L' | 'XL',
    colorName: string
  ) => void;
  onOpenShopifySetup: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  bestSellerProducts,
  diagnostics,
  wishlistIds,
  onToggleWishlist,
  onSelectCategory,
  onSelectProduct,
  onQuickAdd,
  onOpenShopifySetup,
}) => {
  const [heroViewMode, setHeroViewMode] = useState<'editorial' | '3d'>('editorial');
  const [heroSilhouette, setHeroSilhouette] = useState<
    'jacket' | 'hoodie' | 'tshirt' | 'shirt' | 'trousers' | 'coord'
  >('jacket');

  // Newsletter state with honest backend disclosure
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [newsletterNotice, setNewsletterNotice] = useState<string | null>(null);

  const featuredCollectionSlugs: Exclude<
    ClothingCategorySlug,
    'all-clothing' | 'new-arrivals'
  >[] = [
    't-shirts',
    'hoodies-sweatshirts',
    'jackets',
    'shirts',
    'trousers',
    'co-ord-sets',
  ];

  const newArrivals = products.filter((p) => p.isNewArrival).slice(0, 6);
  const isShopifyConnected =
    diagnostics.mode === 'connected_tokenless' ||
    diagnostics.mode === 'connected_authenticated';

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setNewsletterNotice(null);

    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailError('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }

    // Honest disclosure per prompt rule 3.I:
    // "Do not claim a subscription succeeded unless a real backend integration confirms it"
    if (!isShopifyConnected) {
      setNewsletterNotice(
        'Email format validated. Note: Live newsletter enrollment is currently in preview mode because a Shopify customer marketing backend is not yet connected. No subscription was recorded.'
      );
    } else {
      setNewsletterNotice(
        'Email format validated. Customer marketing capture requires a server-side Shopify Admin/Klaviyo webhook endpoint; your email was not stored.'
      );
    }
  };

  return (
    <div className="space-y-24 md:space-y-32 pb-20">
      {/* C. CINEMATIC 3D HERO */}
      <section className="relative min-h-[84vh] w-full border-b border-white/10 overflow-hidden bg-[#0B0B0C]">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[84vh] items-stretch">
          {/* Left Column: Editorial Typography & CTAs */}
          <div className="lg:col-span-6 px-6 sm:px-10 lg:px-14 py-14 lg:py-20 flex flex-col justify-between z-10 bg-gradient-to-b from-[#0B0B0C] via-[#0B0B0C]/95 to-[#0B0B0C]">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#C5A880]">
                <span>AUTUMN / WINTER COLLECTION</span>
                <span aria-hidden="true">·</span>
                <span>CLOTHING ARCHIVE</span>
              </div>
            </div>

            <div className="my-10 lg:my-0 space-y-6">
              <h1
                className="font-display text-[#F5F2EB] tracking-tight leading-[1.04] text-balance"
                style={{ fontSize: 'clamp(2.35rem, 4.2vw, 3.85rem)' }}
              >
                {BRAND_CONFIG.heroHeadline}
              </h1>

              <p className="text-base sm:text-lg text-[#9A9A9E] max-w-xl leading-relaxed font-normal">
                {BRAND_CONFIG.heroSubheadline} Crafted from 340 GSM compact organic jersey, 520 GSM French terry, and Italian virgin wool melton.
              </p>

              {/* Primary & Secondary CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onSelectCategory('new-arrivals')}
                  className="px-7 py-4 bg-[#C5A880] hover:bg-[#d4b992] text-[#0B0B0C] text-xs font-semibold uppercase tracking-[0.18em] flex items-center gap-3 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>SHOP NEW ARRIVALS</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onSelectCategory('all-clothing')}
                  className="px-7 py-4 bg-transparent hover:bg-white/[0.06] text-[#F5F2EB] border border-white/25 hover:border-[#F5F2EB] text-xs font-semibold uppercase tracking-[0.18em] transition-colors whitespace-nowrap shrink-0"
                >
                  EXPLORE THE COLLECTION
                </button>
              </div>
            </div>

            {/* Interactive 3D / Editorial Mode Switcher in Hero Footer */}
            <div className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-[#9A9A9E]">
                <span>Garment Architecture Viewport</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#F5F2EB] font-mono">INR ({BRAND_CONFIG.currencySymbol})</span>
              </div>

              <div className="flex items-center gap-1 p-1 bg-[#141417] border border-white/10">
                <button
                  type="button"
                  onClick={() => setHeroViewMode('editorial')}
                  className={`px-3 py-1.5 text-xs uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 ${
                    heroViewMode === 'editorial'
                      ? 'bg-[#C5A880] text-[#0B0B0C] font-semibold'
                      : 'text-[#9A9A9E] hover:text-[#F5F2EB]'
                  }`}
                >
                  Campaign Photo
                </button>
                <button
                  type="button"
                  onClick={() => setHeroViewMode('3d')}
                  className={`px-3 py-1.5 text-xs uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 ${
                    heroViewMode === '3d'
                      ? 'bg-[#C5A880] text-[#0B0B0C] font-semibold'
                      : 'text-[#9A9A9E] hover:text-[#F5F2EB]'
                  }`}
                >
                  Interactive 3D Drape
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Layered Depth Editorial Photography + Interactive 3D Viewport */}
          <div className="lg:col-span-6 relative min-h-[460px] lg:min-h-full bg-[#121215] border-t lg:border-t-0 lg:border-l border-white/10 overflow-hidden flex flex-col">
            {heroViewMode === 'editorial' ? (
              <div className="relative w-full h-full flex-1 flex flex-col justify-end overflow-hidden group">
                <ResilientImage
                  src={IMG_HERO_CAMPAIGN}
                  alt="ATELIER NOIR brutalist wool overcoat and heavyweight hoodie campaign"
                  cropStyle="top-focus"
                  className="absolute inset-0 w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-black/25 to-transparent" />

                {/* Floating 3D Depth Inspection Card */}
                <div className="relative z-10 m-6 sm:m-8 p-5 bg-[#0B0B0C]/80 backdrop-blur-md border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-[#C5A880]">
                      <span>LOOK 01 · BRUTALIST GALLERY</span>
                    </div>
                    <p className="mt-1 font-display text-lg text-[#F5F2EB]">
                      640 GSM Wool Melton Overcoat & 520 GSM Hoodie
                    </p>
                    <p className="text-xs text-[#9A9A9E] mt-0.5">
                      Inspect the 3D cloth drape simulation or view garment specifications.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setHeroViewMode('3d')}
                      className="px-3.5 py-2.5 bg-white/10 hover:bg-[#C5A880] text-[#F5F2EB] hover:text-[#0B0B0C] text-xs uppercase tracking-wider transition-colors whitespace-nowrap"
                    >
                      Launch 3D Studio
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectProduct('brutalist-wool-overcoat-anthracite')}
                      className="px-3.5 py-2.5 bg-[#C5A880] text-[#0B0B0C] text-xs font-semibold uppercase tracking-wider hover:bg-[#d4b992] transition-colors whitespace-nowrap"
                    >
                      View Coat
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full flex-1 flex flex-col">
                <div className="p-4 bg-[#0B0B0C]/90 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 z-10">
                  <span className="text-xs uppercase tracking-[0.14em] text-[#C5A880]">
                    3D Cloth Drape & Lighting Inspector
                  </span>
                  <div className="flex flex-wrap items-center gap-1">
                    {(
                      [
                        { id: 'jacket', label: 'Outerwear' },
                        { id: 'hoodie', label: '520G Hoodie' },
                        { id: 'tshirt', label: '340G Tee' },
                        { id: 'trousers', label: 'Pleated Trouser' },
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setHeroSilhouette(item.id)}
                        className={`px-2.5 py-1 text-[11px] uppercase tracking-wider transition-colors ${
                          heroSilhouette === item.id
                            ? 'bg-white text-[#0B0B0C] font-semibold'
                            : 'bg-white/[0.05] text-[#9A9A9E] hover:text-[#F5F2EB]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Garment3DCanvas
                  silhouette={heroSilhouette}
                  primaryColorHex="#26272B"
                  roughness={0.74}
                  metalness={0.14}
                  interactive={true}
                  label={`ATELIER 3D FORM: ${heroSilhouette.toUpperCase()}`}
                  className="flex-1 min-h-[420px] w-full"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* D. FEATURED COLLECTIONS (All 6 Clothing-Only Categories) */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-white/10">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#C5A880]">
              01. ARCHITECTURAL WARDROBE
            </span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl text-[#F5F2EB] text-balance">
              Curated Clothing Collections
            </h2>
          </div>
          <p className="text-sm text-[#9A9A9E] max-w-md">
            Every silhouette is drafted exclusively in-house. Strictly clothing — engineered across six foundational garment categories.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCollectionSlugs.map((slug, idx) => {
            const meta = CATEGORY_META[slug];
            const count = products.filter((p) => p.category === slug).length;
            return (
              <button
                key={slug}
                type="button"
                onClick={() => onSelectCategory(slug)}
                className="group relative aspect-[4/5] w-full overflow-hidden bg-[#121215] border border-white/10 text-left flex flex-col justify-end p-6 sm:p-8"
              >
                <ResilientImage
                  src={meta.heroImage}
                  alt={meta.title}
                  cropStyle="top-focus"
                  className="absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] via-[#0B0B0C]/45 to-transparent" />

                <div className="relative z-10 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.16em] text-[#C5A880]">
                    <span>0{idx + 1}</span>
                    <span aria-hidden="true">·</span>
                    <span>{meta.editorialKicker}</span>
                    <span aria-hidden="true">·</span>
                    <span>{count} Pieces</span>
                  </div>

                  <h3 className="font-display text-2xl text-[#F5F2EB] group-hover:text-[#C5A880] transition-colors">
                    {meta.shortTitle === 'T-Shirts' ? 'Oversized T-shirts' : meta.title}
                  </h3>

                  <p className="text-xs text-[#9A9A9E] line-clamp-2 leading-relaxed">
                    {meta.description}
                  </p>

                  <div className="pt-2 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#F5F2EB] group-hover:text-[#C5A880] transition-colors">
                    <span>Explore {meta.shortTitle}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* E. NEW ARRIVALS */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-white/10">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#C5A880]">
              02. SEASONAL RELEASE
            </span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl text-[#F5F2EB]">
              New Arrivals
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onSelectCategory('new-arrivals')}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#F5F2EB] hover:text-[#C5A880] transition-colors whitespace-nowrap shrink-0"
          >
            <span>View All New Arrivals</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {newArrivals.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isWishlisted={wishlistIds.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
              onSelectProduct={onSelectProduct}
              onQuickAdd={onQuickAdd}
            />
          ))}
        </div>
      </section>

      {/* F. EDITORIAL CAMPAIGN */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14">
        <div className="relative overflow-hidden border border-white/15 bg-[#121215]">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-7 relative min-h-[380px] sm:min-h-[480px]">
              <ResilientImage
                src={IMG_EDITORIAL_BRUTALIST}
                alt="ATELIER NOIR Monolith Brutalist Campaign"
                cropStyle="top-focus"
                className="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#121215] hidden lg:block" />
            </div>

            <div className="lg:col-span-5 p-8 sm:p-12 lg:p-14 flex flex-col justify-center space-y-6">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#C5A880]">
                <span>EDITORIAL CAMPAIGN 2026</span>
                <span aria-hidden="true">·</span>
                <span>MONOLITH STUDY</span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl text-[#F5F2EB] leading-tight text-balance">
                Form Follows Heavyweight Substance.
              </h2>

              <p className="text-sm sm:text-base text-[#9A9A9E] leading-relaxed">
                Designed in opposition to disposable fast fashion. Our co-ord ensembles and cavalry wool outerwear rely on structural seam geometry, concealed plackets, and custom-milled high-GSM textiles to command space.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onSelectCategory('co-ord-sets')}
                  className="px-6 py-3.5 bg-[#C5A880] hover:bg-[#d4b992] text-[#0B0B0C] text-xs font-semibold uppercase tracking-[0.16em] inline-flex items-center gap-2 transition-colors"
                >
                  <span>Explore Co-ord Ensembles</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onSelectCategory('jackets')}
                  className="px-6 py-3.5 border border-white/20 hover:border-[#F5F2EB] text-xs font-semibold uppercase tracking-[0.16em] text-[#F5F2EB] transition-colors"
                >
                  Shop Outerwear
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* G. ARCHIVE HIGHLIGHTS (Preview Samples — Never labelled as real Best Sellers without sales data) */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-white/10">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#C5A880]">
              03. CURATED PREVIEW SAMPLES
            </span>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl text-[#F5F2EB]">
              Signature Archive Silhouettes
            </h2>
          </div>

          <div className="max-w-md text-xs text-[#9A9A9E] leading-relaxed">
            <span>
              Displaying local Preview Sample garments for design and interaction evaluation. These items are sample pieces and are not presented as live store inventory.
            </span>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {(bestSellerProducts.length > 0 ? bestSellerProducts : products).slice(0, 3).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isWishlisted={wishlistIds.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
              onSelectProduct={onSelectProduct}
              onQuickAdd={onQuickAdd}
            />
          ))}
        </div>
      </section>

      {/* H. BRAND STORY */}
      <section
        id="brand-story"
        className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center border-y border-white/10 py-16 lg:py-24">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs uppercase tracking-[0.2em] text-[#C5A880]">
              04. THE ATELIER MANIFESTO
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#F5F2EB] leading-[1.1] text-balance">
              Textile Weight as Architectural Discipline.
            </h2>
            <p className="text-base text-[#9A9A9E] leading-relaxed">
              Founded with a singular focus on garment construction, {BRAND_CONFIG.name} rejects ornament in favor of proportion, textile density, and permanence. Every piece in our archive—from 340 GSM combed organic cotton T-shirts to 640 GSM double-faced wool overcoats—is pattern-cut to hold a three-dimensional silhouette on the body.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-white/10">
              <div>
                <span className="font-mono text-xl text-[#F5F2EB] font-semibold tabular-nums">
                  340–640 GSM
                </span>
                <p className="mt-1 text-xs text-[#9A9A9E]">
                  Heavyweight custom-milled jersey, fleece, and virgin wool textiles.
                </p>
              </div>
              <div>
                <span className="font-mono text-xl text-[#F5F2EB] font-semibold tabular-nums">
                  100% Clothing
                </span>
                <p className="mt-1 text-xs text-[#9A9A9E]">
                  Dedicated exclusively to tops, outerwear, shirting, and trousers.
                </p>
              </div>
              <div>
                <span className="font-mono text-xl text-[#F5F2EB] font-semibold tabular-nums">
                  Zero Logos
                </span>
                <p className="mt-1 text-xs text-[#9A9A9E]">
                  Recognizable by shoulder drop, seam geometry, and drape alone.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="aspect-[3/4] bg-[#121215] border border-white/10 overflow-hidden">
              <ResilientImage
                src={IMG_JACKET_OBSIDIAN}
                alt="Atelier Noir tailored wool field jacket craftsmanship"
                className="w-full h-full"
              />
            </div>
            <div className="aspect-[3/4] bg-[#121215] border border-white/10 overflow-hidden mt-8">
              <Garment3DCanvas
                silhouette="coord"
                primaryColorHex="#232428"
                roughness={0.68}
                metalness={0.18}
                interactive={true}
                label="3D Pattern Block"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* I. NEWSLETTER (With Real Email Validation & Honest Backend Status) */}
      <section className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14">
        <div className="p-8 sm:p-12 lg:p-16 bg-[#121215] border border-white/10">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <span className="text-xs uppercase tracking-[0.2em] text-[#C5A880]">
              ARCHIVE DISPATCHES
            </span>
            <h2 className="font-display text-2xl sm:text-3xl text-[#F5F2EB]">
              Private Collection Releases & Atelier Notes
            </h2>
            <p className="text-sm text-[#9A9A9E] leading-relaxed">
              Receive advance notice when limited-run heavyweight jersey and seasonal outerwear drops are released.
            </p>

            <form
              onSubmit={handleNewsletterSubmit}
              noValidate
              className="pt-4 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3.5 bg-[#0B0B0C] border border-white/15 text-sm text-[#F5F2EB] placeholder-[#9A9A9E]/60 focus:outline-none focus:border-[#C5A880]"
              />
              <button
                type="submit"
                className="px-7 py-3.5 bg-[#C5A880] hover:bg-[#d4b992] text-[#0B0B0C] text-xs font-semibold uppercase tracking-[0.16em] transition-colors whitespace-nowrap shrink-0"
              >
                Verify Email
              </button>
            </form>

            {emailError && (
              <div className="mt-3 inline-flex items-center gap-2 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{emailError}</span>
              </div>
            )}

            {newsletterNotice && (
              <div className="mt-4 p-4 bg-[#0B0B0C] border border-[#C5A880]/40 text-left text-xs text-[#9A9A9E] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                <span>{newsletterNotice}</span>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
