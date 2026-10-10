import React, { useState, useEffect } from 'react';
import {
  X,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { ShopifyDiagnostics } from '../types/store';
import {
  getShopifyConfig,
  saveRuntimeShopifyConfig,
  clearRuntimeShopifyConfig,
} from '../config/shopify';

interface ShopifySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagnostics: ShopifyDiagnostics;
  onRetryConnection: () => Promise<void>;
}

export const ShopifySetupModal: React.FC<ShopifySetupModalProps> = ({
  isOpen,
  onClose,
  diagnostics,
  onRetryConnection,
}) => {
  const currentConfig = getShopifyConfig();
  const [storeDomain, setStoreDomain] = useState(currentConfig.storeDomain);
  const [apiVersion, setApiVersion] = useState(currentConfig.storefrontApiVersion);
  const [publicToken, setPublicToken] = useState(currentConfig.publicStorefrontToken);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const latest = getShopifyConfig();
      setStoreDomain(latest.storeDomain);
      setApiVersion(latest.storefrontApiVersion);
      setPublicToken(latest.publicStorefrontToken);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    saveRuntimeShopifyConfig({
      storeDomain: storeDomain.trim(),
      storefrontApiVersion: apiVersion.trim() || '2025-01',
      publicStorefrontToken: publicToken.trim(),
    });
    await onRetryConnection();
    setIsTesting(false);
  };

  const handleResetToEnv = async () => {
    setIsTesting(true);
    clearRuntimeShopifyConfig();
    const envCfg = getShopifyConfig();
    setStoreDomain(envCfg.storeDomain);
    setApiVersion(envCfg.storefrontApiVersion);
    setPublicToken(envCfg.publicStorefrontToken);
    await onRetryConnection();
    setIsTesting(false);
  };

  const isConnected =
    diagnostics.mode === 'connected_tokenless' ||
    diagnostics.mode === 'connected_authenticated';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shopify-setup-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-[#121215] border border-white/15 p-6 md:p-8 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#C5A880]">
              <Terminal className="w-3.5 h-3.5" />
              <span>Official Shopify Storefront API Integration</span>
            </div>
            <h2
              id="shopify-setup-title"
              className="mt-1 font-display text-2xl text-[#F5F2EB]"
            >
              Storefront Connection & Diagnostics
            </h2>
            <p className="mt-1 text-xs text-[#9A9A9E]">
              Connect any Shopify store directly via the official GraphQL Storefront API — no Headless sales channel required.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Shopify setup modal"
            className="p-2 text-[#9A9A9E] hover:text-[#F5F2EB] border border-white/10 hover:border-white/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Diagnostics Status Panel */}
        <div className="mt-6 p-4 bg-[#0B0B0C] border border-white/10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              {isConnected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-[#C5A880] shrink-0" />
              )}
              <span className="text-xs font-semibold uppercase tracking-wider text-[#F5F2EB]">
                {diagnostics.mode === 'connected_tokenless' && 'Connected (Tokenless Public Storefront API)'}
                {diagnostics.mode === 'connected_authenticated' && 'Connected (Authenticated Public Storefront Token)'}
                {diagnostics.mode === 'unconfigured' && 'Development Mode — Store Domain Not Configured'}
                {diagnostics.mode === 'connecting' && 'Testing Storefront GraphQL Handshake...'}
                {diagnostics.mode === 'connection_error' && 'Connection Failed — Using Development Catalog Fallback'}
              </span>
            </div>

            <button
              type="button"
              disabled={isTesting}
              onClick={async () => {
                setIsTesting(true);
                await onRetryConnection();
                setIsTesting(false);
              }}
              className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.12] text-xs text-[#F5F2EB] flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>Retry Connection</span>
            </button>
          </div>

          <p className="text-xs text-[#9A9A9E] leading-relaxed">
            {diagnostics.statusMessage}
          </p>

          {diagnostics.errorDetails && (
            <div className="p-3 bg-red-950/30 border border-red-500/30 text-xs font-mono text-red-200 break-words">
              {diagnostics.errorDetails}
            </div>
          )}

          <div className="pt-2 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-mono text-[#9A9A9E] tabular-nums">
            <div>
              <span className="block text-white/40 uppercase">Store Domain</span>
              <span className="text-[#F5F2EB]">{diagnostics.storeDomain || 'Not set'}</span>
            </div>
            <div>
              <span className="block text-white/40 uppercase">API Version</span>
              <span className="text-[#F5F2EB]">{diagnostics.apiVersion}</span>
            </div>
            <div>
              <span className="block text-white/40 uppercase">Auth Mode</span>
              <span className="text-[#F5F2EB]">
                {diagnostics.hasPublicToken ? 'Public Token Provided' : 'Tokenless Access'}
              </span>
            </div>
            <div>
              <span className="block text-white/40 uppercase">Clothing Loaded</span>
              <span className="text-[#F5F2EB]">
                {diagnostics.productsLoadedCount} items ({diagnostics.filteredFootwearCount} footwear filtered)
              </span>
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSaveAndTest} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-[#F5F2EB] mb-1.5">
                Shopify Store Domain
              </label>
              <input
                type="text"
                value={storeDomain}
                onChange={(e) => setStoreDomain(e.target.value)}
                placeholder="your-brand.myshopify.com"
                className="w-full px-3.5 py-2.5 bg-[#0B0B0C] border border-white/15 text-sm text-[#F5F2EB] font-mono focus:outline-none focus:border-[#C5A880]"
              />
              <span className="mt-1 block text-[11px] text-[#9A9A9E]">
                Enter your real `.myshopify.com` or custom storefront domain.
              </span>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#F5F2EB] mb-1.5">
                Storefront API Version
              </label>
              <input
                type="text"
                value={apiVersion}
                onChange={(e) => setApiVersion(e.target.value)}
                placeholder="2025-01"
                className="w-full px-3.5 py-2.5 bg-[#0B0B0C] border border-white/15 text-sm text-[#F5F2EB] font-mono focus:outline-none focus:border-[#C5A880]"
              />
              <span className="mt-1 block text-[11px] text-[#9A9A9E]">
                Stable version (e.g. `2025-01`).
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#F5F2EB] mb-1.5">
              Public Storefront Access Token (Optional if Tokenless Access is enabled)
            </label>
            <input
              type="text"
              value={publicToken}
              onChange={(e) => setPublicToken(e.target.value)}
              placeholder="Leave blank to attempt Tokenless Storefront API access first"
              className="w-full px-3.5 py-2.5 bg-[#0B0B0C] border border-white/15 text-sm text-[#F5F2EB] font-mono focus:outline-none focus:border-[#C5A880]"
            />
            <span className="mt-1 block text-[11px] text-[#9A9A9E]">
              Never enter Admin API (`shpat_...`) or private secret keys here. Only public Storefront tokens are used.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetToEnv}
              className="px-4 py-2.5 border border-white/15 text-xs uppercase tracking-wider text-[#9A9A9E] hover:text-[#F5F2EB] transition-colors"
            >
              Reset to Environment Defaults
            </button>

            <button
              type="submit"
              disabled={isTesting}
              className="px-6 py-2.5 bg-[#C5A880] hover:bg-[#d4b992] text-[#0B0B0C] text-xs font-semibold uppercase tracking-[0.15em] transition-colors"
            >
              {isTesting ? 'Verifying Storefront API...' : 'Save & Verify Connection'}
            </button>
          </div>
        </form>

        {/* Step-by-Step Setup Instructions */}
        <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#F5F2EB]">
            <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
            <span>How to Configure Your Shopify Store (Without Headless Channel)</span>
          </div>

          <ol className="space-y-2.5 text-xs text-[#9A9A9E] list-decimal list-inside leading-relaxed">
            <li>
              <strong className="text-[#F5F2EB]">Tokenless Access (Zero Token Setup):</strong> Shopify supports tokenless Storefront API access for up to 1,000 variants covering products, collections, search, and cart creation. Simply enter your <code className="text-[#C5A880] font-mono">your-store.myshopify.com</code> domain above and click <em>Save & Verify Connection</em>.
            </li>
            <li>
              <strong className="text-[#F5F2EB]">Custom App Public Token (If Tokenless is Restricted):</strong> In your Shopify Admin, go to <em>Settings → Apps and sales channels → Develop apps → Create an app</em>. Under <em>Configuration → Storefront API integration</em>, enable <code className="text-[#F5F2EB] font-mono">unauthenticated_read_product_listings</code> and <code className="text-[#F5F2EB] font-mono">unauthenticated_write_checkouts</code>.
            </li>
            <li>
              <strong className="text-[#F5F2EB]">Permanent Configuration:</strong> Set <code className="text-[#C5A880] font-mono">VITE_SHOPIFY_STORE_DOMAIN</code>, <code className="text-[#C5A880] font-mono">VITE_SHOPIFY_STOREFRONT_API_VERSION</code>, and optional <code className="text-[#C5A880] font-mono">VITE_SHOPIFY_STOREFRONT_PUBLIC_TOKEN</code> in your environment or <code className="text-[#F5F2EB] font-mono">src/config/shopify.ts</code>. See <code className="text-[#F5F2EB] font-mono">SHOPIFY_SETUP.md</code> in the project root for full details.
            </li>
          </ol>

          <div className="flex items-center justify-between pt-2 text-[11px] text-[#9A9A9E]">
            <span>Strict Clothing-Only Filter: Active (Footwear automatically excluded)</span>
            <a
              href="https://shopify.dev/docs/api/storefront"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[#C5A880] hover:underline"
            >
              <span>Shopify Storefront API Docs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
