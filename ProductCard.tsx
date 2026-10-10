import React from 'react';
import { Heart, Plus } from 'lucide-react';
import { ClothingProduct } from '../types/store';
import { formatMoney } from '../config/brand';
import { ResilientImage } from './ResilientImage';

interface ProductCardProps {
  product: ClothingProduct;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string, e: React.MouseEvent) => void;
  onSelectProduct: (handle: string) => void;
  onQuickAdd: (product: ClothingProduct, size: 'XS' | 'S' | 'M' | 'L' | 'XL', colorName: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onSelectProduct,
  onQuickAdd,
}) => {
  const [selectedColor, setSelectedColor] = React.useState(
    product.colors[0]?.name || 'Obsidian Black'
  );
  const [quickSizeOpen, setQuickSizeOpen] = React.useState(false);
  const [addedFeedback, setAddedFeedback] = React.useState<string | null>(null);

  const primaryImage = product.images[0] || {
    url: '',
    altText: product.title,
  };

  // Single subtle text tag only when supported by real product data (No badge spam / no pills)
  let statusTextTag: string | null = null;
  if (!product.availableForSale) {
    statusTextTag = 'Sold Out';
  } else if (product.compareAtPrice && product.compareAtPrice > product.price) {
    statusTextTag = 'Archive Value';
  } else if (product.isNewArrival) {
    statusTextTag = 'New Release';
  }

  const handleQuickSizeClick = (
    e: React.MouseEvent,
    size: 'XS' | 'S' | 'M' | 'L' | 'XL'
  ) => {
    e.stopPropagation();
    onQuickAdd(product, size, selectedColor);
    setQuickSizeOpen(false);
    setAddedFeedback(`Added ${size}`);
    setTimeout(() => setAddedFeedback(null), 1600);
  };

  return (
    <article
      onClick={() => onSelectProduct(product.handle)}
      className="group cursor-pointer flex flex-col bg-[#121215] border border-white/[0.07] transition-transform duration-200 hover:-translate-y-0.5"
    >
      {/* Product Image Slot (70% height proportion, 3:4 portrait aspect ratio) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#16161A]">
        <ResilientImage
          src={primaryImage.url}
          alt={primaryImage.altText}
          cropStyle={primaryImage.cropStyle}
          className="w-full h-full transition-transform duration-500 group-hover:scale-[1.03]"
        />

        {/* Subtle gradient scrim for top/bottom controls */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/25 opacity-60 group-hover:opacity-80 transition-opacity duration-200" />

        {/* Top Row: Maximum 1 quiet unboxed text label + Wishlist Toggle */}
        <div className="absolute top-3 left-3.5 right-3.5 flex items-center justify-between z-10">
          {statusTextTag ? (
            <span className="text-[11px] uppercase tracking-[0.16em] text-[#F5F2EB]/90 font-medium">
              {statusTextTag}
            </span>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={(e) => onToggleWishlist(product.id, e)}
            aria-label={isWishlisted ? `Remove ${product.title} from wishlist` : `Save ${product.title} to wishlist`}
            className="w-9 h-9 flex items-center justify-center bg-black/45 backdrop-blur-sm border border-white/10 text-[#F5F2EB] hover:border-[#C5A880] transition-colors"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isWishlisted ? 'fill-[#C5A880] text-[#C5A880]' : 'text-[#F5F2EB]'
              }`}
            />
          </button>
        </div>

        {/* Bottom Quick-Add Bar */}
        <div
          className="absolute bottom-3 left-3 right-3 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {addedFeedback ? (
            <div className="w-full py-2 px-3 bg-[#C5A880] text-[#0B0B0C] text-xs font-semibold uppercase tracking-widest text-center">
              {addedFeedback} — In Bag
            </div>
          ) : quickSizeOpen ? (
            <div className="p-2 bg-[#0B0B0C]/95 backdrop-blur-md border border-white/15">
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-[10px] uppercase tracking-widest text-[#9A9A9E]">
                  Select Size ({selectedColor})
                </span>
                <button
                  type="button"
                  onClick={() => setQuickSizeOpen(false)}
                  className="text-[10px] uppercase tracking-wider text-[#9A9A9E] hover:text-[#F5F2EB]"
                >
                  Close
                </button>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {(['XS', 'S', 'M', 'L', 'XL'] as const).map((sz) => {
                  const variant = product.variants.find(
                    (v) => v.size === sz && v.color === selectedColor
                  );
                  const isAvailable = variant ? variant.availableForSale : product.sizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      disabled={!isAvailable}
                      onClick={(e) => handleQuickSizeClick(e, sz)}
                      className={`py-1.5 text-xs font-mono transition-colors ${
                        isAvailable
                          ? 'bg-white/[0.06] text-[#F5F2EB] hover:bg-[#C5A880] hover:text-[#0B0B0C]'
                          : 'bg-transparent text-white/20 line-through cursor-not-allowed'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={!product.availableForSale}
              onClick={() => setQuickSizeOpen(true)}
              className="w-full py-2.5 px-4 bg-[#0B0B0C]/85 hover:bg-[#C5A880] text-[#F5F2EB] hover:text-[#0B0B0C] backdrop-blur-md border border-white/15 hover:border-[#C5A880] text-xs font-medium uppercase tracking-[0.14em] flex items-center justify-center gap-1.5 opacity-95 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 transition-all duration-200 whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{product.availableForSale ? 'Quick Add' : 'Unavailable'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Clean Unboxed Metadata Footer */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Category & Gender as quiet unboxed metadata with typographic separator */}
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-[#9A9A9E]">
            <span>{product.categoryLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{product.gender}</span>
            {product.source === 'development_catalog' && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[#C5A880]/90">Preview Sample</span>
              </>
            )}
          </div>

          <h3 className="mt-1.5 text-base font-semibold text-[#F5F2EB] group-hover:text-[#C5A880] transition-colors line-clamp-1">
            {product.title}
          </h3>
        </div>

        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
          {/* Price in 15px tabular numbers */}
          <div className="flex items-baseline gap-2 font-mono text-[15px] tabular-nums">
            <span className="text-[#F5F2EB] font-medium">
              {formatMoney(product.price, product.currencyCode)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-[#9A9A9E] line-through">
                {formatMoney(product.compareAtPrice, product.currencyCode)}
              </span>
            )}
          </div>

          {/* Color Swatches */}
          <div
            className="flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
            role="group"
            aria-label="Available colorways"
          >
            {product.colors.map((color) => {
              const active = selectedColor === color.name;
              return (
                <button
                  key={color.name}
                  type="button"
                  title={color.name}
                  aria-label={`Select color ${color.name}`}
                  onClick={() => setSelectedColor(color.name)}
                  className={`w-4 h-4 rounded-full border transition-transform ${
                    active
                      ? 'border-[#C5A880] scale-110 ring-1 ring-[#C5A880]/50'
                      : 'border-white/25 hover:border-white/60'
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
};
