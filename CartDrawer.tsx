import React from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowUpRight, AlertCircle } from 'lucide-react';
import { StoreCart } from '../types/store';
import { formatMoney } from '../config/brand';
import { ResilientImage } from './ResilientImage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: StoreCart;
  isUpdating: boolean;
  cartError: string | null;
  onUpdateQuantity: (lineId: string, quantity: number) => void;
  onRemoveLine: (lineId: string) => void;
  onViewFullCart: () => void;
  onOpenShopifySetup: () => void;
  onSelectProduct: (handle: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  isUpdating,
  cartError,
  onUpdateQuantity,
  onRemoveLine,
  onViewFullCart,
  onOpenShopifySetup,
  onSelectProduct,
}) => {
  if (!isOpen) return null;

  const totalItems = cart.lines.reduce((acc, item) => acc + item.quantity, 0);

  const handleProceedToCheckout = () => {
    if (cart.source === 'shopify' && cart.checkoutUrl) {
      window.location.assign(cart.checkoutUrl);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#0B0B0C] border-l border-white/10 h-full flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-4 h-4 text-[#C5A880]" />
            <h2
              id="cart-drawer-title"
              className="font-display text-lg tracking-wider uppercase text-[#F5F2EB]"
            >
              Shopping Bag
            </h2>
            <span className="font-mono text-xs text-[#9A9A9E] tabular-nums">
              ({totalItems})
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shopping bag"
            className="p-2 text-[#9A9A9E] hover:text-[#F5F2EB] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cart Status Banner if Development Mode or Error */}
        {cartError && (
          <div className="px-6 py-3 bg-red-950/50 border-b border-red-500/30 flex items-start gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{cartError}</span>
          </div>
        )}

        {/* Line Items */}
        <div className="flex-1 overflow-y-auto px-6 py-5 divide-y divide-white/[0.08]">
          {cart.lines.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <ShoppingBag className="w-10 h-10 text-white/20 mb-4 stroke-[1.2]" />
              <p className="font-display text-xl text-[#F5F2EB]">
                Your Shopping Bag is Empty
              </p>
              <p className="mt-2 text-xs text-[#9A9A9E] max-w-xs leading-relaxed">
                Explore our heavyweight jersey, architectural outerwear, and tailored trousers to build your wardrobe.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 px-6 py-3 bg-[#C5A880] text-[#0B0B0C] text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#d4b992] transition-colors"
              >
                Explore Clothing
              </button>
            </div>
          ) : (
            cart.lines.map((line) => (
              <div key={line.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                <div
                  onClick={() => {
                    onClose();
                    onSelectProduct(line.productHandle);
                  }}
                  className="w-20 h-26 shrink-0 bg-[#141416] border border-white/10 cursor-pointer overflow-hidden"
                >
                  <ResilientImage
                    src={line.imageUrl}
                    alt={line.title}
                    className="w-full h-full"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectProduct(line.productHandle);
                        }}
                        className="text-left text-sm font-medium text-[#F5F2EB] hover:text-[#C5A880] transition-colors line-clamp-1"
                      >
                        {line.title}
                      </button>
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => onRemoveLine(line.id)}
                        aria-label={`Remove ${line.title} from bag`}
                        className="text-[#9A9A9E] hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-xs text-[#9A9A9E]">
                      <span>Color: {line.color}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">Size: {line.size}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="inline-flex items-center border border-white/15 bg-[#121215]">
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => onUpdateQuantity(line.id, line.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="w-7 h-7 flex items-center justify-center text-[#9A9A9E] hover:text-[#F5F2EB] disabled:opacity-40"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 text-xs font-mono tabular-nums text-[#F5F2EB]">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => onUpdateQuantity(line.id, line.quantity + 1)}
                        aria-label="Increase quantity"
                        className="w-7 h-7 flex items-center justify-center text-[#9A9A9E] hover:text-[#F5F2EB] disabled:opacity-40"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-mono text-sm tabular-nums text-[#F5F2EB]">
                      {formatMoney(line.price * line.quantity, line.currencyCode)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {cart.lines.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-[#121215] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.14em] text-[#9A9A9E]">
                Subtotal
              </span>
              <span className="font-mono text-lg font-semibold tabular-nums text-[#F5F2EB]">
                {formatMoney(cart.subtotalAmount, cart.currencyCode)}
              </span>
            </div>

            <p className="text-[11px] text-[#9A9A9E]">
              Sample prices shown in INR (₹) for design evaluation.
            </p>

            <div className="p-3.5 bg-black/50 border border-[#C5A880]/40 space-y-1.5">
              <div className="flex items-start gap-2 text-xs text-[#F5F2EB]">
                <AlertCircle className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">
                    Design Preview Mode — Preview Samples Only
                  </span>
                  <span className="text-[11px] text-[#9A9A9E] leading-relaxed block mt-0.5">
                    Cart additions, removals, and quantity updates work locally for previewing the storefront. Payment processing and live order creation are disabled.
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onViewFullCart();
              }}
              className="w-full py-3 bg-[#C5A880] hover:bg-[#d4b992] text-[#0B0B0C] text-xs font-semibold uppercase tracking-[0.16em] transition-colors"
            >
              View Full Bag & Order Summary
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
