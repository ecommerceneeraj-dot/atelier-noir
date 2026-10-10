export interface BrandConfig {
  name: string;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  announcementMessage: string;
  shippingAnnouncement: string;
  currencyCode: string;
  currencySymbol: string;
  locale: string;
  contactEmail: string;
  atelierLocation: string;
  socialLinks: {
    instagram: string;
    youtube: string;
    pinterest: string;
    editorialJournal: string;
  };
}

export const BRAND_CONFIG: BrandConfig = {
  name: 'ATELIER NOIR',
  tagline: 'ARCHITECTURAL URBAN LUXURY CLOTHING',
  heroHeadline: 'BUILT FOR YOUR OWN RULES',
  heroSubheadline: 'Elevated essentials. Uncompromising identity.',
  announcementMessage: 'AUTUMN / WINTER ARCHIVE — HEAVYWEIGHT ARCHITECTURAL SILHOUETTES',
  shippingAnnouncement: 'Complimentary insured express dispatch across India on all clothing orders above ₹15,000',
  currencyCode: 'INR',
  currencySymbol: '₹',
  locale: 'en-IN',
  contactEmail: 'concierge@ateliernoir.studio',
  atelierLocation: 'Kala Ghoda, Mumbai · Design Studio & Archive',
  socialLinks: {
    instagram: 'https://instagram.com',
    youtube: 'https://youtube.com',
    pinterest: 'https://pinterest.com',
    editorialJournal: '#brand-story',
  },
};

export function formatMoney(amount: number, currencyCode = BRAND_CONFIG.currencyCode): string {
  try {
    return new Intl.NumberFormat(BRAND_CONFIG.locale, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${BRAND_CONFIG.currencySymbol}${amount.toLocaleString('en-IN')}`;
  }
}
