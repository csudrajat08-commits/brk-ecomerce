/**
 * Men's catalogue taxonomy — same shape as the women's (womenCatalog.ts), so
 * /men, /men/:sub, the mega menu and the admin work identically.
 */
import type { WomenCategoryDef } from './womenCatalog';
import { stockModels } from './siteAssets';

const EYEBROW = "Men's Collection";

/** `all` is the /men hub; the rest are the men's categories in display order (editable in the admin). */
export const menCategories: WomenCategoryDef[] = [
  {
    slug: 'all',
    label: 'All Men',
    hero: {
      eyebrow: 'Batik Riana Kesuma',
      title: "Men's Collection",
      description: 'Kemeja batik tulis dan cap dari Solo — dari pewarna alam untuk keseharian hingga lurik untuk upacara.',
      main: stockModels.menNightStreet,
      detail: stockModels.menGreyStudio,
    },
  },
  {
    slug: 'long-sleeve-shirt',
    label: 'Long Sleeve Shirt',
    hero: {
      eyebrow: EYEBROW,
      title: 'Long Sleeve Shirt',
      description: 'Kemeja batik lengan panjang — rapi untuk kantor dan acara resmi, nyaman dipakai seharian.',
      main: stockModels.menElderPortrait,
      detail: stockModels.menGreyStudio,
    },
  },
  {
    slug: 'short-sleeve-shirt',
    label: 'Short Sleeve Shirt',
    hero: {
      eyebrow: EYEBROW,
      title: 'Short Sleeve Shirt',
      description: 'Kemeja batik lengan pendek berbahan katun yang ringan — untuk hari kerja dan akhir pekan di iklim tropis.',
      main: stockModels.menIndigoYoung,
      detail: stockModels.menSoganCity,
    },
  },
  {
    slug: 'outer-jacket',
    label: 'Outer & Jacket',
    hero: {
      eyebrow: EYEBROW,
      title: 'Outer & Jacket',
      description: 'Surjan lurik dan outer batik — busana pria tradisional Jawa untuk upacara dan perayaan.',
      main: stockModels.menLurik,
      detail: stockModels.menNightStreet,
    },
  },
];
