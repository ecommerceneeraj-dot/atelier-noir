import React, { useMemo, useState } from 'react';
import { SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import {
  ClothingCategorySlug,
  ClothingGender,
  ClothingProduct,
} from '../types/store';
import { CATEGORY_META } from '../data/developmentCatalog';
import { formatMoney } from '../config/brand';
import { ProductCard } from '../components/ProductCard';

export type SortOption = 'featured' | 'newest' | 'price-asc' | 'price-desc';

interface CatalogueViewProps {
  activeCategory: ClothingCategorySlug;
  activeGenderFilter: ClothingGender | 'All';
  searchQuery: string;
  products: ClothingProduct[];
  wishlistIds: string[];
  onSelectCategory: (slug: ClothingCategorySlug) => void;
  onSelectGender: (gender: ClothingGender | 'All') => void;
  onClearSearch: () => void;
  onToggleWishlist: (productId: string, e: React.MouseEvent) => void;
  onSelectProduct: (handle: string) => void;
  onQuickAdd: (
    product: ClothingProduct,
    size: 'XS' | 'S' | 'M' | 'L' | 'XL',
    colorName: string
  ) => void;
}

export const CatalogueView: React.FC<CatalogueViewProps> = ({
  activeCategory,
  activeGenderFilter,
  searchQuery,
  products,
  wishlistIds,
  onSelectCategory,
  onSelectGender,
  onClearSearch,
  onToggleWishlist,
  onSelectProduct,
  onQuickAdd,
}) => {
  const [selectedSize, setSelectedSize] = useState<'ALL' | 'XS' | 'S' | 'M' | 'L' | 'XL'>('ALL');
  const [selectedColor, setSelectedColor] = useState<string>('ALL');
  const [priceRange, setPriceRange] = useState<'ALL' | 'UNDER_15K' | '15K_30K' | 'OVER_30K'>('ALL');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const categoryMeta = CATEGORY_META[activeCategory] || CATEGORY_META['all-clothing'];

  // Extract all unique colors from the clothing catalogue
  const availableColors = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => {
      p.colors.forEach((c) => {
        if (!map.has(c.name)) map.set(c.name, c.hex);
      });
    });
    return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
  }, [products]);

  // Functional Filtering & Sorting
  const filteredAndSortedProducts = useMemo(() => {
    return products
      .filter((product) => {
        // 1. Category Filter
        if (activeCategory === 'new-arrivals') {
          if (!product.isNewArrival) return false;
        } else if (activeCategory !== 'all-clothing') {
          if (product.category !== activeCategory) return false;
        }

        // 2. Gender Filter (Men / Women / All)
        if (activeGenderFilter !== 'All') {
          if (product.gender !== activeGenderFilter && product.gender !== 'Unisex') {
            return false;
          }
        }

        // 3. Search Query Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = product.title.toLowerCase().includes(q);
          const matchDesc = product.description.toLowerCase().includes(q);
          const matchCat = product.categoryLabel.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCat) return false;
        }

        // 4. Size Filter
        if (selectedSize !== 'ALL') {
          const hasAvailableSize = product.variants.some(
            (v) => v.size === selectedSize && v.availableForSale
          );
          if (!hasAvailableSize) return false;
        }

        // 5. Color Filter
        if (selectedColor !== 'ALL') {
          const hasColor = product.colors.some((c) => c.name === selectedColor);
          if (!hasColor) return false;
        }

        // 6. Price Range Filter (INR)
        if (priceRange === 'UNDER_15K' && product.price >= 15000) return false;
        if (priceRange === '15K_30K' && (product.price < 15000 || product.price > 30000))
          return false;
        if (priceRange === 'OVER_30K' && product.price <= 30000) return false;

        // 7. Availability Filter
        if (onlyInStock && !product.availableForSale) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'price-asc') {
          return a.price - b.price;
        }
        if (sortBy === 'price-desc') {
          return b.price - a.price;
        }
        return 0; // featured order
      });
  }, [
    products,
    activeCategory,
    activeGenderFilter,
    searchQuery,
    selectedSize,
    selectedColor,
    priceRange,
    onlyInStock,
    sortBy,
  ]);

  const resetAllFilters = () => {
    setSelectedSize('ALL');
    setSelectedColor('ALL');
    setPriceRange('ALL');
    setOnlyInStock(false);
    onSelectGender('All');
    if (searchQuery) onClearSearch();
  };

  const hasActiveFilters =
    selectedSize !== 'ALL' ||
    selectedColor !== 'ALL' ||
    priceRange !== 'ALL' ||
    onlyInStock ||
    activeGenderFilter !== 'All' ||
    Boolean(searchQuery.trim());

  const categoryTabs: { slug: ClothingCategorySlug; label: string }[] = [
    { slug: 'all-clothing', label: 'All Clothing' },
    { slug: 'new-arrivals', label: 'New Arrivals' },
    { slug: 't-shirts', label: 'T-Shirts' },
    { slug: 'hoodies-sweatshirts', label: 'Hoodies & Sweatshirts' },
    { slug: 'jackets', label: 'Jackets' },
    { slug: 'shirts', label: 'Shirts' },
    { slug: 'trousers', label: 'Trousers' },
    { slug: 'co-ord-sets', label: 'Co-ord Sets' },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 py-12 space-y-10">
      {/* Catalogue Header */}
      <div className="border-b border-white/10 pb-8 space-y-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#C5A880]">
          <span>{categoryMeta.editorialKicker}</span>
          {activeGenderFilter !== 'All' && (
            <>
              <span aria-hidden="true">·</span>
              <span>{activeGenderFilter}</span>
            </>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl sm:text-5xl text-[#F5F2EB]">
              {categoryMeta.title}
            </h1>
            <p className="mt-2 text-sm text-[#9A9A9E] max-w-2xl leading-relaxed">
              {categoryMeta.description}
            </p>
          </div>

          <div className="font-mono text-xs text-[#9A9A9E] tabular-nums">
            Showing <span className="text-[#F5F2EB] font-semibold">{filteredAndSortedProducts.length}</span> of{' '}
            {products.length} architectural garments
          </div>
        </div>

        {/* Category Navigation Bar */}
        <div className="pt-4 flex items-center gap-2 overflow-x-auto pb-2">
          {categoryTabs.map((tab) => {
            const active = activeCategory === tab.slug;
            return (
              <button
                key={tab.slug}
                type="button"
                onClick={() => onSelectCategory(tab.slug)}
                className={`px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors whitespace-nowrap shrink-0 border ${
                  active
                    ? 'bg-[#C5A880] text-[#0B0B0C] border-[#C5A880] font-semibold'
                    : 'bg-[#121215] text-[#9A9A9E] border-white/10 hover:text-[#F5F2EB] hover:border-white/25'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter & Sort Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#121215] border border-white/10 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="lg:hidden px-3.5 py-2 bg-white/[0.06] border border-white/15 text-xs uppercase tracking-wider text-[#F5F2EB] inline-flex items-center gap-2"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Filters</span>
          </button>

          {/* Gender Segmented Control */}
          <div className="flex items-center bg-[#0B0B0C] border border-white/10 p-0.5">
            {(['All', 'Men', 'Women'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => onSelectGender(g)}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 ${
                  activeGenderFilter === g
                    ? 'bg-white/15 text-[#F5F2EB] font-medium'
                    : 'text-[#9A9A9E] hover:text-[#F5F2EB]'
                }`}
              >
                {g === 'All' ? 'All Genders' : g}
              </button>
            ))}
          </div>

          {/* Desktop Inline Filter Selectors */}
          <div className="hidden lg:flex flex-wrap items-center gap-3">
            {/* Size Filter */}
            <div className="flex items-center gap-1 bg-[#0B0B0C] border border-white/10 px-2.5 py-1">
              <span className="text-[11px] uppercase tracking-wider text-[#9A9A9E] mr-1">
                Size:
              </span>
              {(['ALL', 'XS', 'S', 'M', 'L', 'XL'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`px-2 py-1 text-xs font-mono transition-colors ${
                    selectedSize === sz
                      ? 'bg-[#C5A880] text-[#0B0B0C] font-semibold'
                      : 'text-[#9A9A9E] hover:text-[#F5F2EB]'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            {/* Color Filter */}
            <select
              aria-label="Filter by color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="px-3 py-2 bg-[#0B0B0C] border border-white/10 text-xs text-[#F5F2EB] focus:outline-none focus:border-[#C5A880]"
            >
              <option value="ALL">Color: All Shades</option>
              {availableColors.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Price Range Filter */}
            <select
              aria-label="Filter by price range"
              value={priceRange}
              onChange={(e) =>
                setPriceRange(e.target.value as 'ALL' | 'UNDER_15K' | '15K_30K' | 'OVER_30K')
              }
              className="px-3 py-2 bg-[#0B0B0C] border border-white/10 text-xs text-[#F5F2EB] focus:outline-none focus:border-[#C5A880]"
            >
              <option value="ALL">Price: All Ranges</option>
              <option value="UNDER_15K">Under {formatMoney(15000)}</option>
              <option value="15K_30K">
                {formatMoney(15000)} – {formatMoney(30000)}
              </option>
              <option value="OVER_30K">Above {formatMoney(30000)}</option>
            </select>

            {/* Availability Checkbox */}
            <label className="inline-flex items-center gap-2 px-3 py-2 bg-[#0B0B0C] border border-white/10 text-xs text-[#F5F2EB] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="accent-[#C5A880]"
              />
              <span>In Stock Only</span>
            </label>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="px-3 py-2 text-xs text-[#C5A880] hover:underline inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="catalogue-sort" className="text-xs uppercase tracking-wider text-[#9A9A9E]">
            Sort:
          </label>
          <select
            id="catalogue-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3.5 py-2 bg-[#0B0B0C] border border-white/15 text-xs text-[#F5F2EB] focus:outline-none focus:border-[#C5A880]"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
      </div>

      {/* Mobile Expandable Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="lg:hidden p-5 bg-[#121215] border border-white/15 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#F5F2EB]">
              Filter Garments
            </span>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="text-xs text-[#9A9A9E]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <span className="block text-xs uppercase tracking-wider text-[#9A9A9E] mb-2">
              Size
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(['ALL', 'XS', 'S', 'M', 'L', 'XL'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`px-3 py-1.5 text-xs font-mono border ${
                    selectedSize === sz
                      ? 'bg-[#C5A880] text-[#0B0B0C] border-[#C5A880] font-semibold'
                      : 'border-white/15 text-[#F5F2EB]'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#9A9A9E] mb-1">
                Colorway
              </label>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0B0C] border border-white/15 text-xs text-[#F5F2EB]"
              >
                <option value="ALL">All Shades</option>
                {availableColors.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#9A9A9E] mb-1">
                Price Range
              </label>
              <select
                value={priceRange}
                onChange={(e) =>
                  setPriceRange(e.target.value as 'ALL' | 'UNDER_15K' | '15K_30K' | 'OVER_30K')
                }
                className="w-full px-3 py-2 bg-[#0B0B0C] border border-white/15 text-xs text-[#F5F2EB]"
              >
                <option value="ALL">All Prices</option>
                <option value="UNDER_15K">Under ₹15,000</option>
                <option value="15K_30K">₹15,000 – ₹30,000</option>
                <option value="OVER_30K">Above ₹30,000</option>
              </select>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-xs text-[#F5F2EB]">
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              className="accent-[#C5A880]"
            />
            <span>Show only in-stock variants</span>
          </label>
        </div>
      )}

      {/* Active Search Banner */}
      {searchQuery.trim() && (
        <div className="p-4 bg-[#121215] border border-[#C5A880]/40 flex items-center justify-between">
          <span className="text-xs text-[#F5F2EB]">
            Filtering by search query: <strong className="text-[#C5A880]">“{searchQuery}”</strong>
          </span>
          <button
            type="button"
            onClick={onClearSearch}
            className="text-xs uppercase tracking-wider text-[#9A9A9E] hover:text-[#F5F2EB]"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Product Grid */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="py-20 text-center bg-[#121215] border border-white/10 space-y-4">
          <p className="font-display text-2xl text-[#F5F2EB]">
            No Matching Clothing Found
          </p>
          <p className="text-xs text-[#9A9A9E] max-w-md mx-auto leading-relaxed">
            No garments match your current filter combination. Reset your filters to view all available pieces in our archive.
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="px-6 py-3 bg-[#C5A880] text-[#0B0B0C] text-xs font-semibold uppercase tracking-[0.16em]"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredAndSortedProducts.map((product) => (
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
      )}
    </div>
  );
};
