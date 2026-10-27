/**
 * Brand + navigation configuration.
 * Contact details and store list are taken from the public batikrianakesuma.com
 * site (October 2026). Social handles are UNCONFIRMED — verify with BRK.
 */

export const brand = {
  name: 'Batik Riana Kesuma',
  short: 'BRK',
  founded: 1997,
  origin: 'Solo, Central Java',
  founder: 'Riana Kusuma',
  tagline: 'Comfort · Elegant · Classic',
};

/** Seller details printed on invoices. NPWP is a PLACEHOLDER — replace with BRK's real tax ID. */
export const invoiceIssuer = {
  legalName: 'Batik Riana Kesuma',
  address: 'Jl. Bintaro Utama V Blok EB1 No. 71, Bintaro Jaya, Tangerang Selatan, Banten 15224',
  npwp: '00.000.000.0-000.000 (contoh)',
  vatRate: 0.11,
  returnsDays: 7,
};

export const contact = {
  headOffice: {
    label: 'Showroom & Head Office',
    address: 'Jl. Bintaro Utama V Blok EB1 No. 71, Bintaro Jaya, Tangerang Selatan',
    phones: ['+62 21 7374356', '+62 878 0950 0700'],
  },
  solo: {
    label: 'Showroom Solo',
    address: 'Jl. Imam Bonjol No. 34, Keprabon Wetan, Surakarta',
    phones: ['+62 271 645186', '+62 811 2645 186'],
  },
  email: 'creative.batikrianakesuma@gmail.com',
  whatsapp: '+62 813 9610 577',
};

export const stores = [
  { city: 'Jakarta', name: 'Pondok Indah Mall', detail: 'Metro & SOGO' },
  { city: 'Jakarta', name: 'Plaza Indonesia', detail: 'Metro & SOGO' },
  { city: 'Jakarta', name: 'Grand Indonesia', detail: 'Alun Alun Indonesia' },
  { city: 'Jakarta', name: 'Sarinah Thamrin', detail: '' },
  { city: 'Surabaya', name: 'Tunjungan Plaza', detail: 'SOGO' },
];

export const social = [
  { name: 'Instagram', href: 'https://www.instagram.com/batikrianakesuma/', verified: false },
  { name: 'Facebook', href: 'https://www.facebook.com/batikrianakesuma', verified: false },
  { name: 'TikTok', href: 'https://www.tiktok.com/@batikrianakesuma', verified: false },
  { name: 'YouTube', href: 'https://www.youtube.com/@batikrianakesuma', verified: false },
] as const;

export interface NavItem {
  label: string;
  to: string;
  /** Path prefix that marks this item active (defaults to `to`) */
  match?: string;
}

export const primaryNav: NavItem[] = [
  { label: 'New Arrivals', to: '/shop?new=1' },
  { label: 'Women', to: '/women', match: '/women' },
  { label: 'Men', to: '/men', match: '/men' },
  { label: 'Kebaya & Traditional', to: '/shop/kebaya-traditional' },
];

export const secondaryNav: NavItem[] = [
  { label: 'Collections', to: '/collections' },
  { label: 'Our Story', to: '/about' },
];

export const announcements = [
  { text: 'Indonesia Fashion Week 2026 — the runway collection is now online', to: '/shop?collection=ifw-2026' },
  { text: 'Complimentary shipping across Indonesia on orders above IDR 1.500.000', to: '/care/shipping' },
  { text: 'Uniforms, custom batik & wholesale — enquire with our atelier', to: '/wholesale' },
];

/** Sample commerce rules — prototype values, confirm with BRK operations. */
export const commerceRules = {
  freeShippingThreshold: 1_500_000,
  shippingRates: { standard: 35_000, express: 75_000, pickup: 0 },
};
