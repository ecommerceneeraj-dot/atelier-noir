import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Heart,
  Ruler,
  Minus,
  Plus,
  Check,
  AlertCircle,
  Truck,
  RotateCcw,
  Box,
} from 'lucide-react';
import { ClothingProduct, StoreCart } from '../types/store';
import { BRAND_CONFIG, formatMoney } from '../config/brand';
import { ResilientImage } from '../components/ResilientImage';
import { Garment3DCanvas } from '../components/Garment3DCanvas';
import { ProductCard } from '../components/ProductCard';

interface ProductDetailViewProps {
  product: ClothingProduct;
  relatedProducts: ClothingProduct[];
  cart: StoreCart;
  wishlistIds: string[];
  onBack: () => void;
  onToggleWishlist: (productId: string, e: React.MouseEvent) => void;
  onAddToCart: (variantId: string, quantity: number, openDrawer?: boolean) => Promise<void>;
  onOpenSizeGuide: () => void;
  onOpenShopifySetup: () => void;
  onSelectProduct: (handle: string) => void;
  onQuickAdd: (
    product: ClothingProduct,
    size: 'XS' | 'S' | 'M' | 'L' | 'XL',
    colorName: string
  ) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  relatedProducts,
  cart,
  wishlistIds,
  onBack,
  onToggleWishlist,
  onAddToCart,
  onOpenSizeGuide,
  onOpenShopifySetup,
  onSelectProduct,
  onQuickAdd,
}) => {
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors[0]?.name || 'Obsidian Black'
  );
  // Require explicit size selection before adding to cart
  const [selectedSize, setSelectedSize] = useState<'XS' | 'S' | 'M' | 'L' | 'XL' | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);
  const [show3DInspector, setShow3DInspector] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [buyNowNotice, setBuyNowNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reset state when switching products
  useEffect(() => {
    setSelectedColor(product.colors[0]?.name || 'Obsidian Black');
    setSelectedSize(null);
    setQuantity(1);
    setActiveMediaIndex(0);
    setShow3DInspector(false);
    setValidationMessage(null);
    setBuyNowNotice(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id]);

  const activeColorObj =
    product.colors.find((c) => c.name === selectedColor) || product.colors[0];

  const selectedVariant = selectedSize
    ? product.variants.find(
        (v) => v.size === selectedSize && v.color === selectedColor
      ) || product.variants.find((v) => v.size === selectedSize)
    : null;

  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const displayCompareAt = selectedVariant
    ? selectedVariant.compareAtPrice
    : product.compareAtPrice;
  const isVariantAvailable = selectedVariant
    ? selectedVariant.availableForSale
    : product.availableForSale;

  const isWishlisted = wishlistIds.includes(product.id);

  const handleAddToCartClick = async () => {
    setValidationMessage(null);
    setBuyNowNotice(null);

    if (!selectedSize) {
      setValidationMessage('Please select a garment size (XS–XL) before adding to your bag.');
      return;
    }

    if (!selectedVariant || !selectedVariant.availableForSale) {
      setValidationMessage('The selected size and colorway combination is currently unavailable.');
      return;
    }

    setIsSubmitting(true);
    await onAddToCart(selectedVariant.id, quantity, true);
    setIsSubmitting(false);
  };

  const handleBuyNowClick = async () => {
    setValidationMessage(null);
    setBuyNowNotice(null);

    if (!selectedSize) {
      setValidationMessage('Please select a garment size (XS–XL) to proceed with Buy Now.');
      return;
    }

    if (!selectedVariant || !selectedVariant.availableForSale) {
      setValidationMessage('The selected size and colorway combination is currently unavailable.');
      return;
    }

    setIsSubmitting(true);
    await onAddToCart(selectedVariant.id, quantity, false);
    setIsSubmitting(false);

    setBuyNowNotice(
      'Preview Sample added to your Shopping Bag. Note: This storefront is running in Design Preview Mode — no payments are processed and no real orders are created.'
    );
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 py-10 space-y-24">
      {/* Top Breadcrumb & Back Action */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#9A9A9E] hover:text-[#F5F2EB] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalogue</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-[#9A9A9E]">
          <span>{product.categoryLabel}</span>
          <span aria-hidden="true">/</span>
          <span className="text-[#F5F2EB] truncate max-w-[200px]">{product.title}</span>
        </div>
      </div>

      {/* Main PDP Contiguous Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Sticky Gallery + 3D Garment Viewport Toggle */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[3/4] w-full bg-[#121215] border border-white/10 overflow-hidden">
            {show3DInspector ? (
              <Garment3DCanvas
                silhouette={product.garment3DProfile.silhouette}
                primaryColorHex={activeColorObj?.hex || product.garment3DProfile.primaryColorHex}
                roughness={product.garment3DProfile.fabricRoughness}
                metalness={product.garment3DProfile.fabricMetalness}
                interactive={true}
                label={`${product.title} · ${product.garment3DProfile.gsmWeightLabel}`}
                className="w-full h-full"
              />
            ) : (
              <ResilientImage
                src={product.images[activeMediaIndex]?.url || product.images[0]?.url || ''}
                alt={product.images[activeMediaIndex]?.altText || product.title}
                cropStyle={product.images[activeMediaIndex]?.cropStyle}
                className="w-full h-full"
              />
            )}

            {/* Toggle 3D / Photo Button */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShow3DInspector(!show3DInspector)}
                className={`px-3.5 py-2 text-xs uppercase tracking-wider backdrop-blur-md border transition-colors inline-flex items-center gap-1.5 ${
                  show3DInspector
                    ? 'bg-[#C5A880] text-[#0B0B0C] border-[#C5A880] font-semibold'
                    : 'bg-black/65 text-[#F5F2EB] border-white/20 hover:border-[#C5A880]'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>{show3DInspector ? 'Return to Studio Photo' : 'Inspect 3D Drape'}</span>
              </button>
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="grid grid-cols-4 gap-3">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setShow3DInspector(false);
                  setActiveMediaIndex(idx);
                }}
                className={`aspect-[3/4] overflow-hidden border transition-all ${
                  !show3DInspector && activeMediaIndex === idx
                    ? 'border-[#C5A880] ring-1 ring-[#C5A880]'
                    : 'border-white/10 opacity-70 hover:opacity-100'
                }`}
              >
                <ResilientImage
                  src={img.url}
                  alt={img.altText}
                  cropStyle={img.cropStyle}
                  className="w-full h-full"
                />
              </button>
            ))}

            <button
              type="button"
              onClick={() => setShow3DInspector(true)}
              className={`aspect-[3/4] bg-[#141418] border flex flex-col items-center justify-center p-3 text-center transition-all ${
                show3DInspector
                  ? 'border-[#C5A880] ring-1 ring-[#C5A880]'
                  : 'border-white/10 opacity-80 hover:opacity-100'
              }`}
            >
              <Box className="w-5 h-5 text-[#C5A880] mb-1.5" />
              <span className="text-[10px] uppercase tracking-widest text-[#F5F2EB]">
                3D Silhouette
              </span>
              <span className="text-[9px] text-[#9A9A9E] mt-0.5">
                {product.garment3DProfile.gsmWeightLabel}
              </span>
            </button>
          </div>
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 bg-[#121215] border border-white/10 p-6 sm:p-8 space-y-6">
          {/* Unboxed Metadata Kicker */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-[#9A9A9E]">
              <span>{product.categoryLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{product.gender}</span>
              {product.source === 'development_catalog' && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#C5A880]">Preview Sample</span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={(e) => onToggleWishlist(product.id, e)}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              className="p-2 border border-white/10 hover:border-[#C5A880] text-[#F5F2EB] transition-colors"
            >
              <Heart
                className={`w-4 h-4 ${
                  isWishlisted ? 'fill-[#C5A880] text-[#C5A880]' : 'text-[#F5F2EB]'
                }`}
              />
            </button>
          </div>

          {/* Title & Price */}
          <div>
            <h1 className="font-display text-2xl sm:text-3xl text-[#F5F2EB] leading-snug">
              {product.title}
            </h1>
            <p className="mt-1.5 text-xs text-[#9A9A9E]">{product.subtitle}</p>

            <div className="mt-4 flex items-baseline gap-3 font-mono tabular-nums">
              <span className="text-2xl font-semibold text-[#F5F2EB]">
                {formatMoney(displayPrice, product.currencyCode)}
              </span>
              {displayCompareAt && displayCompareAt > displayPrice && (
                <span className="text-sm text-[#9A9A9E] line-through">
                  {formatMoney(displayCompareAt, product.currencyCode)}
                </span>
              )}
              <span className="text-xs text-[#9A9A9E] font-sans">
                ({product.currencyCode} · Taxes included where applicable)
              </span>
            </div>
          </div>

          {/* Availability Status (No fake stock counts) */}
          <div className="py-2.5 px-3.5 bg-[#0B0B0C] border border-white/[0.08] flex items-center justify-between text-xs">
            <span className="text-[#9A9A9E] uppercase tracking-wider">Availability Status</span>
            {isVariantAvailable ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>Available for Dispatch</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-red-400 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Currently Unavailable</span>
              </span>
            )}
          </div>

          {/* Color Selector */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="uppercase tracking-wider text-[#9A9A9E]">
                Color: <strong className="text-[#F5F2EB]">{selectedColor}</strong>
              </span>
              <span className="font-mono text-[11px] text-[#9A9A9E]">
                {product.garment3DProfile.gsmWeightLabel}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              {product.colors.map((color) => {
                const active = selectedColor === color.name;
                return (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color.name)}
                    className={`px-3.5 py-2 border text-xs flex items-center gap-2 transition-all ${
                      active
                        ? 'border-[#C5A880] bg-white/[0.06] text-[#F5F2EB]'
                        : 'border-white/15 bg-[#0B0B0C] text-[#9A9A9E] hover:text-[#F5F2EB]'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/30"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span>{color.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Selector + Size Guide Modal Trigger */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="uppercase tracking-wider text-[#9A9A9E]">
                Select Size:{' '}
                <strong className="text-[#F5F2EB] font-mono">
                  {selectedSize || 'Required'}
                </strong>
              </span>
              <button
                type="button"
                onClick={onOpenSizeGuide}
                className="inline-flex items-center gap-1.5 text-[#C5A880] hover:underline uppercase tracking-wider"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Size Guide</span>
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {(['XS', 'S', 'M', 'L', 'XL'] as const).map((sz) => {
                const variantForCombo = product.variants.find(
                  (v) => v.size === sz && v.color === selectedColor
                );
                const available = variantForCombo
                  ? variantForCombo.availableForSale
                  : product.sizes.includes(sz);
                const isSelected = selectedSize === sz;

                return (
                  <button
                    key={sz}
                    type="button"
                    disabled={!available}
                    onClick={() => {
                      setSelectedSize(sz);
                      setValidationMessage(null);
                    }}
                    className={`py-3 text-xs font-mono border transition-colors ${
                      !available
                        ? 'border-white/5 bg-black/30 text-white/20 line-through cursor-not-allowed'
                        : isSelected
                        ? 'border-[#C5A880] bg-[#C5A880] text-[#0B0B0C] font-semibold'
                        : 'border-white/15 bg-[#0B0B0C] text-[#F5F2EB] hover:border-white/40'
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs uppercase tracking-wider text-[#9A9A9E]">
              Quantity
            </span>
            <div className="inline-flex items-center border border-white/15 bg-[#0B0B0C]">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="w-9 h-9 flex items-center justify-center text-[#9A9A9E] hover:text-[#F5F2EB]"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-4 text-xs font-mono tabular-nums text-[#F5F2EB]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                aria-label="Increase quantity"
                className="w-9 h-9 flex items-center justify-center text-[#9A9A9E] hover:text-[#F5F2EB]"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Validation or Buy Now Feedback */}
          {validationMessage && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{validationMessage}</span>
            </div>
          )}

          {buyNowNotice && (
            <div className="p-3.5 bg-[#0B0B0C] border border-[#C5A880]/40 text-xs text-[#9A9A9E]">
              <p className="text-[#F5F2EB] leading-relaxed">{buyNowNotice}</p>
            </div>
          )}

          {/* Primary Actions: Add to Cart & Buy Now */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              disabled={isSubmitting || !product.availableForSale}
              onClick={handleAddToCartClick}
              className="w-full py-4 px-6 bg-[#C5A880] hover:bg-[#d4b992] text-[#0B0B0C] text-xs font-semibold uppercase tracking-[0.18em] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Updating Bag...' : 'Add to Cart'}
            </button>

            <button
              type="button"
              disabled={isSubmitting || !product.availableForSale}
              onClick={handleBuyNowClick}
              className="w-full py-3.5 px-6 bg-transparent hover:bg-white/[0.06] text-[#F5F2EB] border border-white/25 hover:border-[#F5F2EB] text-xs font-semibold uppercase tracking-[0.18em] transition-colors disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>

          {/* Description, Material & Care, Shipping & Returns */}
          <div className="pt-6 border-t border-white/10 space-y-6 text-xs text-[#9A9A9E] leading-relaxed">
            <div>
              <h2 className="text-[#F5F2EB] font-semibold uppercase tracking-[0.14em] mb-2">
                Garment Architecture & Description
              </h2>
              <p>{product.description}</p>
              {product.fitNotes && (
                <p className="mt-2 text-[#F5F2EB]/80">{product.fitNotes}</p>
              )}
            </div>

            {product.materialAndCare && product.materialAndCare.length > 0 && (
              <div className="pt-4 border-t border-white/[0.06]">
                <h2 className="text-[#F5F2EB] font-semibold uppercase tracking-[0.14em] mb-2">
                  Material & Care Specifications
                </h2>
                <ul className="space-y-1.5 list-disc list-inside">
                  {product.materialAndCare.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-4 border-t border-white/[0.06] space-y-2.5">
              <h2 className="text-[#F5F2EB] font-semibold uppercase tracking-[0.14em]">
                Shipping & Archival Returns
              </h2>
              <div className="flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                <span>{BRAND_CONFIG.shippingAnnouncement}.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <RotateCcw className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                <span>
                  14-day return and size exchange eligibility on unworn clothing with original security tags attached.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Clothing Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-white/10">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-[#C5A880]">
                COMPLEMENTARY SILHOUETTES
              </span>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl text-[#F5F2EB]">
                Related Architectural Clothing
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {relatedProducts.slice(0, 3).map((rel) => (
              <ProductCard
                key={rel.id}
                product={rel}
                isWishlisted={wishlistIds.includes(rel.id)}
                onToggleWishlist={onToggleWishlist}
                onSelectProduct={onSelectProduct}
                onQuickAdd={onQuickAdd}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
