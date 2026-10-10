import React from 'react';
import { X, Shield, Truck, RotateCcw, FileText, Heart, User } from 'lucide-react';
import { BRAND_CONFIG, formatMoney } from '../config/brand';
import { ClothingProduct, ShopifyDiagnostics } from '../types/store';
import { ResilientImage } from './ResilientImage';

export type PolicyModalType =
  | 'shipping'
  | 'returns'
  | 'privacy'
  | 'terms'
  | 'contact'
  | 'account'
  | null;

interface PolicyAndAccountModalProps {
  activeModal: PolicyModalType;
  onClose: () => void;
  wishlistedProducts: ClothingProduct[];
  onSelectProduct: (handle: string) => void;
  onRemoveWishlist: (id: string, e: React.MouseEvent) => void;
  diagnostics: ShopifyDiagnostics;
  onOpenShopifySetup: () => void;
}

export const PolicyAndAccountModal: React.FC<PolicyAndAccountModalProps> = ({
  activeModal,
  onClose,
  wishlistedProducts,
  onSelectProduct,
  onRemoveWishlist,
  diagnostics,
  onOpenShopifySetup,
}) => {
  if (!activeModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#121215] border border-white/15 p-6 md:p-8 max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <span className="text-[11px] uppercase tracking-[0.16em] text-[#C5A880]">
              {BRAND_CONFIG.name} ARCHIVE CLIENT SERVICES
            </span>
            <h2 className="mt-1 font-display text-2xl text-[#F5F2EB]">
              {activeModal === 'shipping' && 'Shipping & Dispatch Policy'}
              {activeModal === 'returns' && 'Returns & Exchanges Policy'}
              {activeModal === 'privacy' && 'Privacy & Data Stewardship'}
              {activeModal === 'terms' && 'Terms of Service'}
              {activeModal === 'contact' && 'Atelier Concierge & Studio'}
              {activeModal === 'account' && 'Client Profile & Saved Archive'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-[#9A9A9E] hover:text-[#F5F2EB] border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 text-sm text-[#9A9A9E] leading-relaxed space-y-4">
          {activeModal === 'shipping' && (
            <>
              <div className="flex items-center gap-2 text-[#F5F2EB] font-medium">
                <Truck className="w-4 h-4 text-[#C5A880]" />
                <span>Insured Express Garment Transit</span>
              </div>
              <p>
                {BRAND_CONFIG.shippingAnnouncement}. All garments are steamed, inspected, and sealed in breathable archival garment covers prior to dispatch.
              </p>
              <p>
                Final shipping rates, carrier selection, and estimated delivery windows are calculated dynamically during your official Shopify Storefront checkout based on your delivery pin code.
              </p>
            </>
          )}

          {activeModal === 'returns' && (
            <>
              <div className="flex items-center gap-2 text-[#F5F2EB] font-medium">
                <RotateCcw className="w-4 h-4 text-[#C5A880]" />
                <span>14-Day Archival Return & Size Exchange Window</span>
              </div>
              <p>
                Unworn, unwashed clothing with original woven security tags and garment packaging intact may be returned or exchanged for an alternate size within 14 days of delivery.
              </p>
              <p>
                To initiate a return or size exchange, contact <span className="text-[#F5F2EB] font-mono">{BRAND_CONFIG.contactEmail}</span> with your Shopify order reference number.
              </p>
            </>
          )}

          {activeModal === 'privacy' && (
            <>
              <div className="flex items-center gap-2 text-[#F5F2EB] font-medium">
                <Shield className="w-4 h-4 text-[#C5A880]" />
                <span>Zero-Telemetry & Shopify Storefront Security</span>
              </div>
              <p>
                {BRAND_CONFIG.name} processes all cart and checkout transactions directly through the official Shopify Storefront API over encrypted HTTPS. Payment credentials are handled exclusively on Shopify’s PCI-DSS Level 1 compliant checkout domain.
              </p>
              <p>
                Your local wishlist and cart preferences are stored in browser localStorage strictly to preserve your session across page reloads.
              </p>
            </>
          )}

          {activeModal === 'terms' && (
            <>
              <div className="flex items-center gap-2 text-[#F5F2EB] font-medium">
                <FileText className="w-4 h-4 text-[#C5A880]" />
                <span>Storefront Terms & Conditions</span>
              </div>
              <p>
                {BRAND_CONFIG.name} is an exclusive clothing label specializing in architectural tops, outerwear, shirting, trousers, and co-ord sets. All prices are displayed in {BRAND_CONFIG.currencyCode} ({BRAND_CONFIG.currencySymbol}) unless configured otherwise by your connected Shopify store.
              </p>
              <p>
                When running in Development Preview mode without a configured Shopify Storefront domain, items are displayed for visual and functional evaluation only and cannot be purchased until a real Shopify checkout URL is active.
              </p>
            </>
          )}

          {activeModal === 'contact' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#0B0B0C] border border-white/10 space-y-2">
                <span className="text-xs uppercase tracking-widest text-[#C5A880] block">
                  Direct Client Concierge
                </span>
                <p className="text-[#F5F2EB] font-mono text-sm">
                  {BRAND_CONFIG.contactEmail}
                </p>
                <p className="text-xs text-[#9A9A9E]">
                  Monday – Saturday · 10:00 AM to 7:00 PM IST
                </p>
              </div>
              <div className="p-4 bg-[#0B0B0C] border border-white/10 space-y-2">
                <span className="text-xs uppercase tracking-widest text-[#C5A880] block">
                  Design Studio & Showroom
                </span>
                <p className="text-[#F5F2EB] text-sm">{BRAND_CONFIG.atelierLocation}</p>
                <p className="text-xs text-[#9A9A9E]">
                  Private appointments and bespoke garment fittings available upon request.
                </p>
              </div>
            </div>
          )}

          {activeModal === 'account' && (
            <div className="space-y-6">
              <div className="p-4 bg-[#0B0B0C] border border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/[0.06] border border-white/15 flex items-center justify-center text-[#C5A880]">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#F5F2EB]">
                      Design Preview Session
                    </p>
                    <p className="text-xs text-[#9A9A9E]">
                      Local Preview Sample Catalogue · Saved wishlist & bag persist in your browser
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-4 h-4 text-[#C5A880]" />
                  <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#F5F2EB]">
                    Saved Wishlist Garments ({wishlistedProducts.length})
                  </h3>
                </div>

                {wishlistedProducts.length === 0 ? (
                  <p className="text-xs text-[#9A9A9E] py-6 text-center border border-white/[0.06] bg-[#0B0B0C]">
                    You have not saved any garments to your wishlist yet. Click the heart icon on any clothing piece to save it here.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {wishlistedProducts.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          onClose();
                          onSelectProduct(item.handle);
                        }}
                        className="p-3 bg-[#0B0B0C] border border-white/10 hover:border-[#C5A880]/50 flex items-center gap-3 cursor-pointer"
                      >
                        <div className="w-14 h-18 shrink-0 bg-[#18181B]">
                          <ResilientImage
                            src={item.images[0]?.url || ''}
                            alt={item.title}
                            className="w-full h-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[#F5F2EB] truncate">
                            {item.title}
                          </p>
                          <p className="text-[11px] font-mono text-[#C5A880] mt-0.5">
                            {formatMoney(item.price, item.currencyCode)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => onRemoveWishlist(item.id, e)}
                          className="text-xs text-[#9A9A9E] hover:text-red-400 px-2 py-1"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
