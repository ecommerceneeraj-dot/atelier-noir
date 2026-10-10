import React, { useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { ClothingProduct } from '../types/store';
import { formatMoney } from '../config/brand';
import { ResilientImage } from './ResilientImage';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  results: ClothingProduct[];
  onSelectProduct: (handle: string) => void;
  onViewAllResults: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  onClose,
  searchQuery,
  onSearchQueryChange,
  results,
  onSelectProduct,
  onViewAllResults,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const quickSuggestions = ['340 GSM Oversized', '520 GSM Hoodie', 'Virgin Wool', 'Poplin Shirt', 'Co-ord Set'];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Search clothing catalog"
      onClick={onClose}
    >
      <div
        className="w-full bg-[#0B0B0C] border-b border-white/15 px-6 py-8 md:px-12"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/20">
            <div className="flex items-center gap-3 flex-1">
              <Search className="w-5 h-5 text-[#C5A880] shrink-0" />
              <input
                ref={inputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    onClose();
                    onViewAllResults();
                  }
                }}
                placeholder="Search architectural clothing by silhouette, fabric weight (e.g., 340 GSM), or category..."
                className="w-full bg-transparent text-lg md:text-xl text-[#F5F2EB] placeholder-[#9A9A9E]/60 focus:outline-none"
              />
            </div>

            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchQueryChange('')}
                className="text-xs uppercase tracking-wider text-[#9A9A9E] hover:text-[#F5F2EB]"
              >
                Clear
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="p-2 text-[#9A9A9E] hover:text-[#F5F2EB] border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Search Terms */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#9A9A9E]">
            <span className="uppercase tracking-widest text-white/40">Popular Searches:</span>
            {quickSuggestions.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => onSearchQueryChange(term)}
                className="hover:text-[#C5A880] underline underline-offset-4 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>

          {/* Live Results Preview */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-[0.15em] text-[#9A9A9E]">
                {searchQuery.trim()
                  ? `Matching Garments (${results.length})`
                  : 'Featured Archive Silhouettes'}
              </span>
              {results.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewAllResults();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#C5A880] hover:underline"
                >
                  <span>View All in Catalogue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {results.length === 0 ? (
              <div className="py-12 text-center border border-white/[0.06] bg-[#121215]">
                <p className="font-display text-lg text-[#F5F2EB]">
                  No clothing items match “{searchQuery}”
                </p>
                <p className="mt-1 text-xs text-[#9A9A9E]">
                   ATELIER NOIR is exclusively a clothing label. Try searching for Oversized T-Shirts, Hoodies, Jackets, Shirts, Trousers, or Co-ord Sets.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-[52vh] overflow-y-auto pr-1">
                {results.slice(0, 4).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectProduct(item.handle);
                    }}
                    className="group text-left bg-[#121215] border border-white/[0.07] p-3 hover:border-[#C5A880]/50 transition-colors flex flex-col"
                  >
                    <div className="aspect-[3/4] w-full overflow-hidden bg-[#18181B] mb-3">
                      <ResilientImage
                        src={item.images[0]?.url || ''}
                        alt={item.title}
                        cropStyle={item.images[0]?.cropStyle}
                        className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-[#9A9A9E]">
                      {item.categoryLabel}
                    </span>
                    <span className="mt-1 text-xs font-medium text-[#F5F2EB] group-hover:text-[#C5A880] line-clamp-1">
                      {item.title}
                    </span>
                    <span className="mt-1 font-mono text-xs tabular-nums text-[#F5F2EB]">
                      {formatMoney(item.price, item.currencyCode)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
