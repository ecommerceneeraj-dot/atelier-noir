import React from 'react';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  ArrowUpRight,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { StoreCart } from '../types/store';
import { BRAND_CONFIG, formatMoney } from '../config/brand';
import { ResilientImage } from '../components/ResilientImage';

interface CartPageViewProps {
  cart: StoreCart;
  isUpdating: boolean;
  cartError: string | null;
  onUpdateQuantity: (lineId: string, quantity: number) => void;
  onRemoveLine: (lineId: string) => void;
  onContinueShopping: () => void;
  onOpenShopifySetup: () => void;
  onSelectProduct: (handle: string) => void;
}

export const CartPageView: React.FC<CartPageViewProps> = ({
  cart,
  isUpdating,
  cartError,
  onUpdateQuantity,
  onRemoveLine,
  onContinueShopping,
  onOpenShopifySetup,
  onSelectProduct,
}) => {
  const handleCheckout = () => {
    if (cart.source === 'shopify' && cart.checkoutUrl) {
      window.location.assign(cart.checkoutUrl);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 py-12 space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-[#C5A880]">
            GARMENT BAG & ORDER SUMMARY
          </span>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl text-[#F5F2EB]">
            Your Shopping Bag
          </h1>
        </div>

        <button
          type="button"
          onClick={onContinueShopping}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#9A9A9E] hover:text-[#F5F2EB] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Exploring Clothing</span>
        </button>
      </div>

      {cartError && (
        <div className="p-4 bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{cartError}</span>
        </div>
      )}

      {cart.lines.length === 0 ? (
        <div className="py-24 text-center bg-[#121215] border border-white/10 space-y-4">
          <ShoppingBag className="w-12 h-12 text-white/20 mx-auto stroke-[1.2]" />
          <h2 className="font-display text-2xl text-[#F5F2EB]">
            Your Shopping Bag is Empty
          </h2>
          <p className="text-xs text-[#9A9A9E] max-w-md mx-auto leading-relaxed">
            Browse our New Arrivals, 340 GSM Oversized T-Shirts, 520 GSM Hoodies, and Tailored Outerwear to add pieces to your bag.
          </p>
          <button
            type="button"
            onClick={onContinueShopping}
            className="mt-4 px-8 py-4 bg-[#C5A880] text-[#0B0B0C] text-xs font-semibold uppercase tracking-[0.16em]"
          >
            Shop All Clothing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Line Items Table */}
          <div className="lg:col-span-8 bg-[#121215] border border-white/10 divide-y divide-white/10">
            {cart.lines.map((line) => (
              <div
                key={line.id}
                className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              >
                <div className="flex items-center gap-5">
                  <div
                    onClick={() => onSelectProduct(line.productHandle)}
                    className="w-24 h-32 shrink-0 bg-[#18181B] border border-white/10 cursor-pointer overflow-hidden"
                  >
                    <ResilientImage
                      src={line.imageUrl}
                      alt={line.title}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[11px] uppercase tracking-widest text-[#9A9A9E]">
                      {line.categoryLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectProduct(line.productHandle)}
                      className="block text-left font-display text-lg text-[#F5F2EB] hover:text-[#C5A880] transition-colors"
                    >
                      {line.title}
                    </button>
                    <div className="flex items-center gap-3 text-xs text-[#9A9A9E]">
                      <span>Color: {line.color}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">Size: {line.size}</span>
                    </div>
                    <div className="font-mono text-xs text-[#9A9A9E] tabular-nums pt-1">
                      Unit Price: {formatMoney(line.price, line.currencyCode)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-white/10 pt-4 sm:pt-0">
                  <div className="inline-flex items-center border border-white/15 bg-[#0B0B0C]">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => onUpdateQuantity(line.id, line.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="w-8 h-8 flex items-center justify-center text-[#9A9A9E] hover:text-[#F5F2EB]"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3.5 text-xs font-mono tabular-nums text-[#F5F2EB]">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => onUpdateQuantity(line.id, line.quantity + 1)}
                      aria-label="Increase quantity"
                      className="w-8 h-8 flex items-center justify-center text-[#9A9A9E] hover:text-[#F5F2EB]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right min-w-[90px]">
                    <span className="font-mono text-base font-semibold tabular-nums text-[#F5F2EB]">
                      {formatMoney(line.price * line.quantity, line.currencyCode)}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => onRemoveLine(line.id)}
                    aria-label={`Remove ${line.title}`}
                    className="p-2 text-[#9A9A9E] hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Module */}
          <div className="lg:col-span-4 bg-[#121215] border border-white/10 p-6 sm:p-8 space-y-6">
            <h2 className="font-display text-xl text-[#F5F2EB] border-b border-white/10 pb-4">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-[#9A9A9E]">
                <span>Items Subtotal</span>
                <span className="font-mono tabular-nums text-[#F5F2EB]">
                  {formatMoney(cart.subtotalAmount, cart.currencyCode)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#9A9A9E]">
                <span>Shipping Estimate</span>
                <span className="text-xs text-[#F5F2EB]">
                  {cart.subtotalAmount >= 15000
                    ? 'Complimentary Express (Preview)'
                    : 'Sample Standard Rate'}
                </span>
              </div>
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.16em] text-[#F5F2EB] font-semibold">
                  Sample Subtotal
                </span>
                <span className="font-mono text-xl font-semibold tabular-nums text-[#C5A880]">
                  {formatMoney(cart.subtotalAmount, cart.currencyCode)}
                </span>
              </div>
            </div>

            <div className="p-4 bg-[#0B0B0C] border border-[#C5A880]/40 space-y-2">
              <div className="flex items-start gap-2.5 text-xs">
                <AlertCircle className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-[#F5F2EB] font-semibold block">
                    Design Preview Mode — Preview Samples Only
                  </span>
                  <p className="text-[#9A9A9E] leading-relaxed">
                    This shopping bag operates with local Preview Sample data so you can test adding items, adjusting quantities, and reviewing totals. Payment processing and live order creation are disabled.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-start gap-2.5 text-[11px] text-[#9A9A9E]">
              <ShieldCheck className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
              <span>
                {BRAND_CONFIG.shippingAnnouncement}. Preview Sample catalogue — not real store inventory.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
