import { ClothingCategorySlug, ClothingProduct } from '../types/store';

export interface CategoryMeta {
  slug: ClothingCategorySlug;
  title: string;
  shortTitle: string;
  description: string;
  editorialKicker: string;
  heroImage: string;
}

export const IMG_HERO_CAMPAIGN = '/src/assets/images/hero_atelier_noir_campaign_1791559220893.jpg';
export const IMG_TEE_NOIR = '/src/assets/images/product_oversized_tee_noir_1791559240139.jpg';
export const IMG_HOODIE_SLATE = '/src/assets/images/product_heavy_hoodie_slate_1791559254159.jpg';
export const IMG_JACKET_OBSIDIAN = '/src/assets/images/product_technical_jacket_obsidian_1791559268850.jpg';
export const IMG_SHIRT_IVORY = '/src/assets/images/product_structured_shirt_ivory_1791559284434.jpg';
export const IMG_TROUSERS_CHARCOAL = '/src/assets/images/product_pleated_trousers_charcoal_1791559299613.jpg';
export const IMG_EDITORIAL_BRUTALIST = '/src/assets/images/editorial_brutalist_campaign_1791559324355.jpg';

export const CATEGORY_META: Record<ClothingCategorySlug, CategoryMeta> = {
  'all-clothing': {
    slug: 'all-clothing',
    title: 'All Architectural Clothing',
    shortTitle: 'All Clothing',
    description: 'Complete archive of heavyweight jersey, tailored outerwear, structured shirting, and wide-leg trousers.',
    editorialKicker: 'COMPLETE GARMENT ARCHIVE',
    heroImage: IMG_EDITORIAL_BRUTALIST,
  },
  'new-arrivals': {
    slug: 'new-arrivals',
    title: 'New Arrivals — Autumn / Winter',
    shortTitle: 'New Arrivals',
    description: 'First-release silhouettes engineered from high-density organic cottons, virgin wool blends, and crisp architectural poplin.',
    editorialKicker: 'SEASONAL RELEASE 01',
    heroImage: IMG_HERO_CAMPAIGN,
  },
  't-shirts': {
    slug: 't-shirts',
    title: 'Oversized T-Shirts',
    shortTitle: 'T-Shirts',
    description: '340 GSM combed compact cotton jersey cut with dropped shoulders, mock-neck ribbing, and architectural drape.',
    editorialKicker: 'HEAVYWEIGHT JERSEY',
    heroImage: IMG_TEE_NOIR,
  },
  'hoodies-sweatshirts': {
    slug: 'hoodies-sweatshirts',
    title: 'Hoodies & Sweatshirts',
    shortTitle: 'Hoodies & Sweatshirts',
    description: '520 GSM loopback French terry fleece with double-lined drawcord-free hoods and articulated sleeve seams.',
    editorialKicker: 'STRUCTURED FLEECE',
    heroImage: IMG_HOODIE_SLATE,
  },
  jackets: {
    slug: 'jackets',
    title: 'Jackets & Outerwear',
    shortTitle: 'Jackets',
    description: 'Cropped technical wool field jackets, monolithic overcoats, and storm-flap blousons built for structural permanence.',
    editorialKicker: 'OUTERWEAR ARCHITECTURE',
    heroImage: IMG_JACKET_OBSIDIAN,
  },
  shirts: {
    slug: 'shirts',
    title: 'Architectural Shirts',
    shortTitle: 'Shirts',
    description: 'High-density Italian cotton poplin and brushed twill overshirts with concealed plackets and sharp geometric collars.',
    editorialKicker: 'TAILORED SHIRTING',
    heroImage: IMG_SHIRT_IVORY,
  },
  trousers: {
    slug: 'trousers',
    title: 'Tailored & Cargo Trousers',
    shortTitle: 'Trousers',
    description: 'Double-pleated wide-leg virgin wool trousers and articulated matte twill trousers with full-length drape.',
    editorialKicker: 'LOWER SILHOUETTES',
    heroImage: IMG_TROUSERS_CHARCOAL,
  },
  'co-ord-sets': {
    slug: 'co-ord-sets',
    title: 'Monolith Co-ord Sets',
    shortTitle: 'Co-ord Sets',
    description: 'Synchronized two-piece ensembles pairing boxy overshirts or heavyweight tops with matching tailored trousers.',
    editorialKicker: 'UNIFIED ENSEMBLES',
    heroImage: IMG_JACKET_OBSIDIAN,
  },
};

function createVariants(
  baseId: string,
  price: number,
  colors: { name: string; hex: string }[],
  sizes: ('XS' | 'S' | 'M' | 'L' | 'XL')[],
  unavailableCombos: string[] = [],
  compareAtPrice?: number
) {
  const list: ClothingProduct['variants'] = [];
  for (const color of colors) {
    for (const size of sizes) {
      const key = `${color.name}-${size}`;
      const isUnavailable = unavailableCombos.includes(key);
      list.push({
        id: `dev-variant-${baseId}-${color.name.toLowerCase().replace(/\s+/g, '-')}-${size.toLowerCase()}`,
        title: `${color.name} / ${size}`,
        size,
        color: color.name,
        price,
        compareAtPrice,
        currencyCode: 'INR',
        availableForSale: !isUnavailable,
        sku: `AN-${baseId.toUpperCase()}-${color.name.slice(0, 3).toUpperCase()}-${size}`,
      });
    }
  }
  return list;
}

/**
 * DEVELOPMENT / DEMO CLOTHING CATALOG
 * Clearly marked with source: 'development_catalog' when Shopify Storefront API is not yet configured.
 * Strictly CLOTHING ONLY (Zero footwear, shoes, boots, or sneakers).
 */
export const DEVELOPMENT_CLOTHING_PRODUCTS: ClothingProduct[] = [
  {
    id: 'dev-prod-01',
    handle: 'monolith-340gsm-oversized-tee-noir',
    title: 'Monolith 340 GSM Oversized T-Shirt',
    subtitle: 'Heavyweight compact cotton jersey with architectural dropped shoulder',
    description:
      'Cut in a boxy architectural block from 340 GSM long-staple compact organic cotton. Features a high-density 3cm ribbed collar that holds its structure indefinitely, reverse twin-needle seam construction, and a clean matte surface finish.',
    category: 't-shirts',
    categoryLabel: 'Oversized T-shirts',
    gender: 'Unisex',
    isNewArrival: true,
    createdAt: '2026-10-01T10:00:00Z',
    price: 6800,
    currencyCode: 'INR',
    availableForSale: true,
    images: [
      {
        url: IMG_TEE_NOIR,
        altText: 'Monolith 340 GSM Oversized T-Shirt in Obsidian Black front studio view',
      },
      {
        url: IMG_HOODIE_SLATE,
        altText: 'Monolith Heavyweight Jersey fabric detail view',
      },
    ],
    colors: [
      { name: 'Obsidian Black', hex: '#121214' },
      { name: 'Warm Chalk', hex: '#EAE6DF' },
      { name: 'Carbon Slate', hex: '#383A3F' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    variants: createVariants(
      'tee01',
      6800,
      [
        { name: 'Obsidian Black', hex: '#121214' },
        { name: 'Warm Chalk', hex: '#EAE6DF' },
        { name: 'Carbon Slate', hex: '#383A3F' },
      ],
      ['XS', 'S', 'M', 'L', 'XL'],
      ['Warm Chalk-XL']
    ),
    materialAndCare: [
      '100% GOTS-certified compact organic cotton (340 GSM)',
      'High-tension 1x1 rib neckband with Lycra recovery core',
      'Cold gentle machine wash inside out; dry flat in shade',
      'Do not tumble dry or iron directly on seam allowances',
    ],
    fitNotes: 'Intentionally oversized boxy fit with dropped shoulders. Take your normal size for the signature editorial drape, or size down once for a closer silhouette.',
    garment3DProfile: {
      silhouette: 'tshirt',
      primaryColorHex: '#151518',
      fabricRoughness: 0.85,
      fabricMetalness: 0.05,
      gsmWeightLabel: '340 GSM Heavy Jersey',
    },
    source: 'development_catalog',
  },
  {
    id: 'dev-prod-02',
    handle: 'atelier-520gsm-boxy-hoodie-slate',
    title: 'Archive 520 GSM Loopback Hoodie',
    subtitle: 'Drawcord-free structured double hood in pigment-washed charcoal fleece',
    description:
      'Engineered for sculptural volume without excess hardware. Crafted from custom-milled 520 GSM diagonal loopback French terry cotton, enzyme-washed for a muted mineral patina. Double-layered hood stands upright independently.',
    category: 'hoodies-sweatshirts',
    categoryLabel: 'Hoodies & Sweatshirts',
    gender: 'Unisex',
    isNewArrival: true,
    createdAt: '2026-10-03T12:00:00Z',
    price: 14500,
    compareAtPrice: 16500,
    currencyCode: 'INR',
    availableForSale: true,
    images: [
      {
        url: IMG_HOODIE_SLATE,
        altText: 'Archive 520 GSM Loopback Hoodie in Washed Slate studio portrait',
      },
      {
        url: IMG_TEE_NOIR,
        altText: 'Archive Hoodie silhouette comparison',
      },
    ],
    colors: [
      { name: 'Washed Slate', hex: '#3A3D42' },
      { name: 'Obsidian Black', hex: '#111113' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    variants: createVariants(
      'hd02',
      14500,
      [
        { name: 'Washed Slate', hex: '#3A3D42' },
        { name: 'Obsidian Black', hex: '#111113' },
      ],
      ['XS', 'S', 'M', 'L', 'XL'],
      ['Washed Slate-XS'],
      16500
    ),
    materialAndCare: [
      '100% heavyweight combed cotton loopback French terry (520 GSM)',
      'Double-self-fabric hood with reinforced flatlock shoulder seams',
      'Garment-dyed and enzyme-washed for zero shrinkage',
      'Wash cold separately; reshape whilst damp and dry flat',
    ],
    fitNotes: 'Cropped slightly at the waistband with wide-set chest and articulated sleeves.',
    garment3DProfile: {
      silhouette: 'hoodie',
      primaryColorHex: '#3A3D42',
      fabricRoughness: 0.9,
      fabricMetalness: 0.02,
      gsmWeightLabel: '520 GSM French Terry',
    },
    source: 'development_catalog',
  },
  {
    id: 'dev-prod-03',
    handle: 'cropped-technical-wool-field-jacket',
    title: 'Obsidian Technical Wool Field Jacket',
    subtitle: 'Tailored cropped outerwear with concealed storm placket and funnel collar',
    description:
      'Bridging bespoke Savile Row tailoring and brutalist urban outerwear. Tailored from water-repellent virgin wool cavalry twill bonded to a breathable membrane. Features architectural bellows pockets, concealedmatte horn snap closures, and an articulated high funnel collar.',
    category: 'jackets',
    categoryLabel: 'Jackets & Outerwear',
    gender: 'Men',
    isNewArrival: true,
    createdAt: '2026-10-05T14:30:00Z',
    price: 32000,
    currencyCode: 'INR',
    availableForSale: true,
    images: [
      {
        url: IMG_JACKET_OBSIDIAN,
        altText: 'Obsidian Technical Wool Field Jacket worn in dark concrete studio',
      },
      {
        url: IMG_HERO_CAMPAIGN,
        altText: 'Outerwear campaign architectural view',
        cropStyle: 'top-focus',
      },
    ],
    colors: [
      { name: 'Obsidian Black', hex: '#141416' },
      { name: 'Anthracite Melange', hex: '#2D2E32' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    variants: createVariants(
      'jkt03',
      32000,
      [
        { name: 'Obsidian Black', hex: '#141416' },
        { name: 'Anthracite Melange', hex: '#2D2E32' },
      ],
      ['S', 'M', 'L', 'XL']
    ),
    materialAndCare: [
      '78% Virgin Wool, 22% Technical Polyamide outer shell (410 GSM)',
      '100% Bemberg Cupro anti-static full lining',
      'Concealed matte anodised snap hardware and internal welt pocket',
      'Specialist dry clean only',
    ],
    fitNotes: 'Structured shoulder line with a clean cropped waist termination that pairs naturally with high-waisted pleated trousers.',
    garment3DProfile: {
      silhouette: 'jacket',
      primaryColorHex: '#18181B',
      fabricRoughness: 0.72,
      fabricMetalness: 0.12,
      gsmWeightLabel: '410 GSM Cavalry Wool',
    },
    source: 'development_catalog',
  },
  {
    id: 'dev-prod-04',
    handle: 'poplin-architectural-shirt-ivory',
    title: 'Concealed Placket Architectural Shirt',
    subtitle: 'Crisp high-density warm ivory cotton poplin with elongated cuffs',
    description:
      'An exercise in purist proportion. Woven from 180 GSM high-twist organic cotton poplin in a warm alabaster ivory tone. Designed with a sharp geometric point collar, hidden mother-of-pearl placket, deep back box pleat, and architectural 9cm cuffs.',
    category: 'shirts',
    categoryLabel: 'Shirts',
    gender: 'Women',
    isNewArrival: true,
    createdAt: '2026-10-04T09:15:00Z',
    price: 11800,
    currencyCode: 'INR',
    availableForSale: true,
    images: [
      {
        url: IMG_SHIRT_IVORY,
        altText: 'Concealed Placket Architectural Shirt in Warm Ivory studio portrait',
      },
      {
        url: IMG_EDITORIAL_BRUTALIST,
        altText: 'Architectural shirting worn in brutalist gallery campaign',
        cropStyle: 'top-focus',
      },
    ],
    colors: [
      { name: 'Warm Ivory', hex: '#EFECE4' },
      { name: 'Obsidian Black', hex: '#141416' },
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    variants: createVariants(
      'sht04',
      11800,
      [
        { name: 'Warm Ivory', hex: '#EFECE4' },
        { name: 'Obsidian Black', hex: '#141416' },
      ],
      ['XS', 'S', 'M', 'L']
    ),
    materialAndCare: [
      '100% High-twist organic cotton poplin (180 GSM)',
      'Smoked mother-of-pearl buttons concealed beneath front fly placket',
      'Single-needle French seam construction throughout (22 stitches per inch)',
      'Cool gentle wash or dry clean; steam press while damp',
    ],
    fitNotes: 'Relaxed architectural drape across the torso with structured collar stand and elongated sleeves.',
    garment3DProfile: {
      silhouette: 'shirt',
      primaryColorHex: '#EAE5D9',
      fabricRoughness: 0.65,
      fabricMetalness: 0.04,
      gsmWeightLabel: '180 GSM Crisp Poplin',
    },
    source: 'development_catalog',
  },
  {
    id: 'dev-prod-05',
    handle: 'double-pleated-wide-wool-trousers',
    title: 'Double-Pleated Wide Virgin Wool Trousers',
    subtitle: 'Full-length architectural drape in brushed charcoal flannel',
    description:
      'Tailored with deep forward-facing double pleats that create fluid vertical movement. Cut from mid-weight 310 GSM combed virgin wool with a soft flannel finish, extended tab waistband, horn buttons, and reinforced heel guards.',
    category: 'trousers',
    categoryLabel: 'Trousers',
    gender: 'Unisex',
    isNewArrival: true,
    createdAt: '2026-10-06T16:00:00Z',
    price: 18500,
    currencyCode: 'INR',
    availableForSale: true,
    images: [
      {
        url: IMG_TROUSERS_CHARCOAL,
        altText: 'Double-Pleated Wide Virgin Wool Trousers in Charcoal Melange',
      },
      {
        url: IMG_JACKET_OBSIDIAN,
        altText: 'Tailored wool trouser pairing with field jacket',
      },
    ],
    colors: [
      { name: 'Charcoal Melange', hex: '#36383C' },
      { name: 'Obsidian Black', hex: '#121215' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    variants: createVariants(
      'trs05',
      18500,
      [
        { name: 'Charcoal Melange', hex: '#36383C' },
        { name: 'Obsidian Black', hex: '#121215' },
      ],
      ['XS', 'S', 'M', 'L', 'XL']
    ),
    materialAndCare: [
      '100% Responsible Wool Standard (RWS) Virgin Wool (310 GSM)',
      'Half-lined to the knee in breathable Bemberg Cupro',
      'Internal rubberized shirt-grip waistband with hook-and-bar closure',
      'Dry clean only; press with cloth barrier',
    ],
    fitNotes: 'High-rise waist with generous volume through the thigh and a clean wide-leg column cut.',
    garment3DProfile: {
      silhouette: 'trousers',
      primaryColorHex: '#36383C',
      fabricRoughness: 0.8,
      fabricMetalness: 0.06,
      gsmWeightLabel: '310 GSM Virgin Wool',
    },
    source: 'development_catalog',
  },
  {
    id: 'dev-prod-06',
    handle: 'monolith-interlock-coord-ensemble',
    title: 'Monolith Interlock Knit Co-ord Set',
    subtitle: 'Two-piece architectural overshirt and wide-leg trouser ensemble',
    description:
      'A unified two-piece urban luxury uniform comprising our boxy concealed-snap overshirt and matching wide-leg drawstring tailored trousers. Knitted from 420 GSM double-faced Milano interlock jersey that resists creasing while holding a sharp tailored crease.',
    category: 'co-ord-sets',
    categoryLabel: 'Co-ord Sets',
    gender: 'Unisex',
    isNewArrival: true,
    createdAt: '2026-10-07T11:00:00Z',
    price: 26500,
    compareAtPrice: 29500,
    currencyCode: 'INR',
    availableForSale: true,
    images: [
      {
        url: IMG_JACKET_OBSIDIAN,
        altText: 'Monolith Interlock Knit Co-ord Set in Obsidian Black',
      },
      {
        url: IMG_TROUSERS_CHARCOAL,
        altText: 'Monolith Co-ord Set wide-leg trouser detail',
      },
    ],
    colors: [
      { name: 'Obsidian Black', hex: '#141417' },
      { name: 'Warm Stone', hex: '#D8D2C5' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    variants: createVariants(
      'crd06',
      26500,
      [
        { name: 'Obsidian Black', hex: '#141417' },
        { name: 'Warm Stone', hex: '#D8D2C5' },
      ],
      ['XS', 'S', 'M', 'L', 'XL'],
      [],
      29500
    ),
    materialAndCare: [
      '82% Organic Cotton, 18% Recycled Polyamide Milano Interlock (420 GSM)',
      'Includes both Boxy Overshirt and Pintuck Wide-Leg Trousers',
      'Wrinkle-resistant architectural structure ideal for transit',
      'Cold gentle machine wash; hang or dry flat',
    ],
    fitNotes: 'Sold as a matched size set. Relaxed boxy top paired with an elasticated-back tailored waist trouser.',
    garment3DProfile: {
      silhouette: 'coord',
      primaryColorHex: '#18181C',
      fabricRoughness: 0.75,
      fabricMetalness: 0.08,
      gsmWeightLabel: '420 GSM Milano Interlock',
    },
    source: 'development_catalog',
  },
  {
    id: 'dev-prod-07',
    handle: 'brutalist-wool-overcoat-anthracite',
    title: 'Brutalist Dropped-Shoulder Wool Overcoat',
    subtitle: 'Full-length double-breasted melton wool coat with sculptural lapels',
    description:
      'Our flagship winter silhouette. Tailored from 640 GSM Italian double-cloth virgin wool melton with raw-edge architectural seam allowances. Features exaggerated peak lapels, dropped shoulders that accommodate heavyweight knitwear or hoodies underneath, and deep welt pockets.',
    category: 'jackets',
    categoryLabel: 'Jackets & Outerwear',
    gender: 'Unisex',
    isNewArrival: false,
    createdAt: '2026-09-18T10:00:00Z',
    price: 46000,
    currencyCode: 'INR',
    availableForSale: true,
    images: [
      {
        url: IMG_HERO_CAMPAIGN,
        altText: 'Brutalist Dropped-Shoulder Wool Overcoat in Anthracite',
        cropStyle: 'top-focus',
      },
      {
        url: IMG_JACKET_OBSIDIAN,
        altText: 'Outerwear collar construction detail',
      },
    ],
    colors: [
      { name: 'Anthracite Melange', hex: '#2B2D30' },
      { name: 'Obsidian Black', hex: '#101012' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    variants: createVariants(
      'jkt07',
      46000,
      [
        { name: 'Anthracite Melange', hex: '#2B2D30' },
        { name: 'Obsidian Black', hex: '#101012' },
      ],
      ['S', 'M', 'L', 'XL'],
      ['Obsidian Black-XL']
    ),
    materialAndCare: [
      '100% Virgin Wool Melton (640 GSM) milled in Biella, Italy',
      'Horn button closures with internal anchor buttons',
      'Full viscose satin lining with dual internal document pockets',
      'Specialist dry clean only',
    ],
    fitNotes: 'Generous architectural overcoat cut designed to layer effortlessly over 520 GSM hoodies.',
    garment3DProfile: {
      silhouette: 'jacket',
      primaryColorHex: '#2B2D30',
      fabricRoughness: 0.88,
      fabricMetalness: 0.04,
      gsmWeightLabel: '640 GSM Wool Melton',
    },
    source: 'development_catalog',
  },
  {
    id: 'dev-prod-08',
    handle: 'raw-seam-mockneck-sweatshirt-noir',
    title: 'Raw-Seam Mockneck 480 GSM Sweatshirt',
    subtitle: 'Boxy mock-neck pullover with articulated reverse-stitched Raglan sleeves',
    description:
      'Constructed from 480 GSM dry-hand organic French terry with exposed coverstitch seam architecture along the raglan sleeve line and spine. A high 4cm mock-neck collar frames the neckline with minimalist precision.',
    category: 'hoodies-sweatshirts',
    categoryLabel: 'Hoodies & Sweatshirts',
    gender: 'Men',
    isNewArrival: false,
    createdAt: '2026-09-20T10:00:00Z',
    price: 11200,
    currencyCode: 'INR',
    availableForSale: true,
    images: [
      {
        url: IMG_HOODIE_SLATE,
        altText: 'Raw-Seam Mockneck 480 GSM Sweatshirt studio view',
      },
      {
        url: IMG_TEE_NOIR,
        altText: 'Heavyweight cotton jersey drape detail',
      },
    ],
    colors: [
      { name: 'Carbon Slate', hex: '#34363B' },
      { name: 'Obsidian Black', hex: '#121214' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    variants: createVariants(
      'sw08',
      11200,
      [
        { name: 'Carbon Slate', hex: '#34363B' },
        { name: 'Obsidian Black', hex: '#121214' },
      ],
      ['XS', 'S', 'M', 'L', 'XL']
    ),
    materialAndCare: [
      '100% Organic Combed Cotton Terry (480 GSM)',
      'Overdyed pigment wash with anti-pilling enzyme finish',
      'Machine wash cold gentle cycle; dry flat',
    ],
    fitNotes: 'Wide chest block with slightly cropped ribbed hem.',
    garment3DProfile: {
      silhouette: 'hoodie',
      primaryColorHex: '#2E3035',
      fabricRoughness: 0.89,
      fabricMetalness: 0.03,
      gsmWeightLabel: '480 GSM Dry Terry',
    },
    source: 'development_catalog',
  },
  {
    id: 'dev-prod-09',
    handle: 'atelier-draped-twill-overshirt',
    title: 'Draped Gabardine Utility Overshirt',
    subtitle: 'Fluid viscose-wool gabardine shirting with dual chest bellows pockets',
    description:
      'Combining thefluidity of fine dress shirting with the structure of an overshirt. Tailored from 260 GSM wool-viscose gabardine that catches subtle studio highlights across every fold.',
    category: 'shirts',
    categoryLabel: 'Shirts',
    gender: 'Unisex',
    isNewArrival: false,
    createdAt: '2026-09-22T10:00:00Z',
    price: 15400,
    currencyCode: 'INR',
    availableForSale: true,
    images: [
      {
        url: IMG_SHIRT_IVORY,
        altText: 'Draped Gabardine Utility Overshirt in Warm Bone',
      },
      {
        url: IMG_JACKET_OBSIDIAN,
        altText: 'Overshirt layered under outerwear',
      },
    ],
    colors: [
      { name: 'Warm Ivory', hex: '#EAE5DC' },
      { name: 'Obsidian Black', hex: '#141416' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    variants: createVariants(
      'sht09',
      15400,
      [
        { name: 'Warm Ivory', hex: '#EAE5DC' },
        { name: 'Obsidian Black', hex: '#141416' },
      ],
      ['XS', 'S', 'M', 'L', 'XL']
    ),
    materialAndCare: [
      '60% Virgin Wool, 40% EcoVero Viscose Gabardine (260 GSM)',
      'Concealed matte corozo nut buttons',
      'Dry clean or hand wash cold',
    ],
    fitNotes: 'Oversized tailored cut designed to be worn open over 340 GSM tees or buttoned alone.',
    garment3DProfile: {
      silhouette: 'shirt',
      primaryColorHex: '#E5DFD3',
      fabricRoughness: 0.6,
      fabricMetalness: 0.08,
      gsmWeightLabel: '260 GSM Wool Gabardine',
    },
    source: 'development_catalog',
  },
  {
    id: 'dev-prod-10',
    handle: 'gallery-column-coord-trench-set',
    title: 'Gallery Column Coat & Trouser Co-ord Set',
    subtitle: 'Architectural bone gabardine longline coat paired with wide pleated trousers',
    description:
      'As featured in our Autumn/Winter Brutalist Gallery campaign. This matched ensemble pairs an ankle-grazing architectural lapel coat with full-length wide-leg trousers in matching 330 GSM cavalry gabardine.',
    category: 'co-ord-sets',
    categoryLabel: 'Co-ord Sets',
    gender: 'Women',
    isNewArrival: true,
    createdAt: '2026-10-08T08:00:00Z',
    price: 38900,
    currencyCode: 'INR',
    availableForSale: true,
    images: [
      {
        url: IMG_EDITORIAL_BRUTALIST,
        altText: 'Gallery Column Coat & Trouser Co-ord Set in Brutalist Architecture Campaign',
        cropStyle: 'top-focus',
      },
      {
        url: IMG_SHIRT_IVORY,
        altText: 'Warm bone fabric close-up',
      },
    ],
    colors: [
      { name: 'Warm Bone', hex: '#E6E0D4' },
      { name: 'Obsidian Black', hex: '#121215' },
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    variants: createVariants(
      'crd10',
      38900,
      [
        { name: 'Warm Bone', hex: '#E6E0D4' },
        { name: 'Obsidian Black', hex: '#121215' },
      ],
      ['XS', 'S', 'M', 'L']
    ),
    materialAndCare: [
      '100% High-density organic cotton cavalry twill (330 GSM)',
      'Set includes Longline Architectural Coat + Wide-Leg Pleated Trousers',
      'Specialist dry clean recommended',
    ],
    fitNotes: 'Elongated vertical column proportion. True to size.',
    garment3DProfile: {
      silhouette: 'coord',
      primaryColorHex: '#E6E0D4',
      fabricRoughness: 0.7,
      fabricMetalness: 0.05,
      gsmWeightLabel: '330 GSM Cavalry Twill',
    },
    source: 'development_catalog',
  },
];
