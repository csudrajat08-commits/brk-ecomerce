/**
 * Central image registry.
 *
 * ⚠ TEMPORARY PRESENTATION IMAGERY
 * Every image below comes from the current public batikrianakesuma.com
 * catalogue (product photography + Indonesia Fashion Week 2026 runway
 * photography). It is used only to make this prototype representative.
 * It is NOT final campaign photography and must be replaced/licensed before
 * launch. Some catalogue shots had their embedded product-name lettering
 * removed by `scripts/optimize-images.mjs`.
 *
 * To replace an image: drop new files in /public/images and point the
 * semantic key at them (or set `url` to a CDN URL). No component changes needed.
 */
import type { ImageAsset } from '../types/commerce';

const ARCHIVE_CREDIT = 'BRK public catalogue (temporary placeholder)';
const STOCK_CREDIT = 'Unsplash License stock — not a BRK garment (temporary placeholder, see image-source/unsplash/CREDITS.md)';
const RUNWAY_CREDIT = 'BRK at Indonesia Fashion Week 2026 — runway archive (temporary placeholder)';

const RUNWAY = 1600 / 2400;
const CATALOGUE = 1080 / 1350;

function runway(file: string, alt: string, focus = '50% 25%'): ImageAsset {
  return { src: `/images/archive/${file}`, alt, ratio: RUNWAY, focus, credit: RUNWAY_CREDIT };
}
function archive(file: string, alt: string, ratio = CATALOGUE, focus = '50% 30%'): ImageAsset {
  return { src: `/images/archive/${file}`, alt, ratio, focus, credit: ARCHIVE_CREDIT };
}
function editorial(file: string, alt: string, ratio: number, focus = '50% 50%'): ImageAsset {
  return { src: `/images/editorial/${file}`, alt, ratio, focus, credit: ARCHIVE_CREDIT };
}

function stock(file: string, alt: string, ratio: number, focus = '50% 25%', dir = 'stock'): ImageAsset {
  return { src: `/images/${dir}/${file}`, alt, ratio, focus, credit: STOCK_CREDIT };
}

/**
 * Model photography for menswear and shawls. BRK's archive only shows these
 * on mannequins, so licensed stock of Indonesian models stands in for now.
 */
export const stockModels = {
  menElder: stock('men-natural-dyed-elder', 'Older Indonesian man and his son in matching long-sleeve batik shirts', 1600 / 2395, '30% 40%'),
  menElderPortrait: stock('men-elder-portrait', 'Portrait of an older Indonesian man in a navy long-sleeve batik shirt', 896 / 1245, '50% 30%', 'editorial'),
  menIndigoYoung: stock('men-indigo-young', 'Young Indonesian man in a short-sleeve blue batik shirt leaning on a painted wall', 1600 / 2400, '50% 30%'),
  menGreyStudio: stock('men-grey-panel-studio', 'Indonesian man in a grey long-sleeve shirt with geometric batik panels', 1600 / 2400, '50% 25%'),
  menSoganCity: stock('men-sogan-parang-city', 'Man seen from behind in a sogan parang batik shirt among city towers', 1600 / 2133, '50% 70%'),
  menNightStreet: stock('men-batik-night-street', 'Man in a long-sleeve batik shirt on a city street at night', 1600 / 2400, '50% 45%'),
  menLurik: stock('men-lurik-portrait', 'Young Javanese man in a striped lurik jacket and batik cap', 1600 / 2198, '50% 30%'),
  scarfPaisley: stock('scarf-paisley-hijab', 'Woman wearing a brown paisley batik scarf as a hijab', 1600 / 2847, '50% 25%'),
  shawlPair: stock('shawl-batik-pair', 'Two people holding hands, draped in sogan and tumpal batik shawls', 1600 / 2397, '50% 40%'),
  shawlIkat: stock('shawl-ikat-red', 'Woman in profile wrapped in a red and navy woven shawl', 1600 / 2400, '50% 30%'),
  scarfRed: stock('scarf-red-batik', 'Young woman with a red batik scarf draped over her head', 1600 / 2098, '50% 25%'),
  shawlCream: stock('shawl-cream-mono', 'Black-and-white portrait of a woman in a cream shawl over batik', 1600 / 2399, '50% 25%'),
  scarfTeal: stock('scarf-teal-hijab', 'Woman wearing a teal patterned silk hijab', 1, '50% 30%'),
  scarfRose: stock('scarf-rose-studio', 'Woman in a rose floral scarf on a white backdrop', 1600 / 2400, '50% 25%'),
  scarfMulticolor: stock('scarf-multicolor-hijab', 'Woman wearing a multicoloured silk scarf as a hijab', 1, '50% 30%'),
} satisfies Record<string, ImageAsset>;

/* ---------- Runway looks (reused by hero + products) ---------- */
export const runwayLooks = {
  navyKebayaWalk: runway('imgl3495', 'Model on the runway in a navy janggan kebaya with an orange batik sarong'),
  navyKebayaClose: runway('imgl3540', 'Close portrait of a model in a navy kebaya and orange batik sash', '50% 18%'),
  navyKebayaTurn: runway('imgl3529', 'Model in navy kebaya and orange hibiscus sarong holding a batik sash'),
  navyKebayaBack: runway('imgl3553', 'Back view of the navy kebaya with a draped orange batik sash'),
  indigoOuterFront: runway('imgl3110', 'Model in a navy long outer with blue floral batik and matching trousers'),
  indigoOuterShawl: runway('imgl3088', 'Model presenting a white and blue batik shawl over a navy outer'),
  indigoOuterSide: runway('imgl3105', 'Model turning to reveal the blue batik shawl in motion'),
  greenHibiscusClose: runway('imgl3435', 'Model in a green hibiscus batik outer with an ochre batik shawl', '50% 20%'),
  greenHibiscusWalk: runway('imgl3450', 'Model walking in the green hibiscus batik outer and skirt'),
  greenHibiscusArm: runway('imgl3474', 'Model extending an ochre batik shawl over a green hibiscus set', '50% 22%'),
  greenHibiscusBack: runway('imgl3488', 'Back view of the green hibiscus set with ochre shawl'),
  soganBlazerFront: runway('imgl3137', 'Model in a black sogan batik blazer holding a cream batik cloth'),
  soganBlazerBack: runway('imgl3157', 'Back view of a black and amber floral batik blazer, cream batik cloth in motion', '50% 20%'),
  obiSetFront: runway('imgl3164', 'Model in a red and black batik outer with obi belt'),
  obiSetShawl: runway('imgl3187', 'Model presenting a red batik shawl over an obi-belted outer'),
  obiSetWalk: runway('imgl3196', 'Model with red flower hairpiece in a red batik outer and black trousers'),
  saffronClose: runway('imgl3213', 'Close portrait in a cream and ochre janggan blouse with hibiscus batik skirt', '50% 18%'),
  saffronWalk: runway('imgl3219', 'Model walking in a janggan blouse and saffron hibiscus skirt'),
  saffronBack: runway('imgl3234', 'Back view of the saffron hibiscus batik skirt'),
  citronWalk: runway('imgl3272', 'Model in a blue janggan blouse with citron hibiscus batik skirt'),
  citronBack: runway('imgl3279', 'Back view of the citron hibiscus set with long shawl'),
  citronShawl: runway('imgl3283', 'Model in citron batik with a flowing shawl'),
  monasKebayaFront: runway('imgl3322', 'Model in a pink kebaya holding a blue batik cloth'),
  monasKebayaBack: runway('imgl3331', 'Back view of a pink tumpal batik kebaya and blue sarong'),
  denimJangganWalk: runway('imgl3339', 'Model in a blue floral janggan blouse with batik-trimmed denim'),
  denimJangganClose: runway('imgl3358', 'Close portrait in a blue floral janggan blouse and denim', '50% 20%'),
  denimJangganBack: runway('imgl3374', 'Back view of the blue floral janggan blouse with denim'),
  pinkJacketWalk: runway('imgl3377', 'Model in a pink batik jacket and wide denim with travel case'),
  pinkJacketClose: runway('imgl3391', 'Close portrait in a pink batik jacket with striped scarf', '50% 20%'),
  pinkJacketSide: runway('imgl3403-1', 'Model in a pink batik jacket walking with a blue case'),
  ifwKebaya: archive('ifw-1', 'Runway look: pink kebaya with blue batik cloth', 840 / 934, '50% 30%'),
  ifwCitron: archive('ifw-2', 'Runway look: citron hibiscus set', 840 / 934, '50% 30%'),
  ifwDenim: archive('ifw-3', 'Runway look: janggan blouse with denim', 840 / 934, '50% 30%'),
  ifwSaffron: archive('ifw-4', 'Runway look: saffron hibiscus set', 840 / 934, '50% 30%'),
  ifwGreen: archive('ifw', 'Runway look: green hibiscus set', 840 / 934, '50% 30%'),
} satisfies Record<string, ImageAsset>;

/* ---------- Semantic site assets ---------- */
export const siteAssets = {
  /** Hero slides — each slide is a triptych of one look (left, centre, right). Mobile uses the centre frame. */
  homeHero: [runwayLooks.navyKebayaWalk, runwayLooks.navyKebayaClose, runwayLooks.navyKebayaBack],
  homeHeroIndigo: [runwayLooks.indigoOuterShawl, runwayLooks.indigoOuterFront, runwayLooks.indigoOuterSide],
  homeHeroHibiscus: [runwayLooks.greenHibiscusWalk, runwayLooks.greenHibiscusClose, runwayLooks.greenHibiscusBack],

  womenCollection: archive('website-27', 'Model in a black silk dress with gold-foil batik florals', CATALOGUE, '50% 20%'),
  menCollection: stockModels.menSoganCity,
  kebayaCollection: runwayLooks.navyKebayaTurn,
  fabricsCollection: editorial('fabric-hokokai', 'Hand-drawn Hokokai batik fabric with butterflies and florals on green parang', 640 / 507),
  shawlsCollection: editorial('stole-pink', 'Model draped in a rose silk batik stole', 640 / 695, '50% 20%'),

  editorialCampaign: editorial('runway-sogan-back', 'Back view of a sogan batik blazer as a cream batik cloth sweeps through the air', 640 / 984, '50% 30%'),
  editorialCampaignDetail: runwayLooks.saffronClose,
  editorialCampaignInset: editorial('fabric-indigo-floral', 'Indigo batik cloth with amber floral motifs', 640 / 507),

  batikCraftsmanship: editorial('fabric-hokokai', 'Close view of hand-drawn Hokokai batik', 640 / 507),
  batikCraftColour: editorial('fabric-cobalt', 'Cobalt batik fabric with layered floral motifs', 640 / 507),
  batikCraftMotif: editorial('shawl-cotton-rail', 'Cotton batik lengths in butterfly, kawung and floral motifs', 1080 * 0.42 / (1350 * 0.45)),
  batikCraftWear: runwayLooks.saffronWalk,

  collectionIfw: runwayLooks.greenHibiscusArm,
  collectionSilk: archive('website-4-1', 'Monochrome silk batik long outer over a black dress'),
  collectionSogan: archive('classic-sogan', 'Classic sogan batik two-piece shown front and back'),
  collectionOsaka: archive('katalog-jepang-1', 'Model in a black dress with an amber batik stole holding a catalogue'),
  collectionEncim: archive('encim-with-lace-collar', 'Encim batik blouse with lace collar shown front and back'),

  wholesaleServices: editorial('shawl-rack-detail', 'Three batik shawls in red parang, blue floral and brown geometric motifs', 605 / 675),
  wholesaleDetail: editorial('runway-sash-detail', 'Detail of a hand-finished batik sash with appliqué flower on a navy kebaya', (1600 * 0.56) / (2400 * 0.37)),

  aboutHero: runwayLooks.soganBlazerFront,
  aboutPortrait: runwayLooks.obiSetWalk,
} satisfies Record<string, ImageAsset | ImageAsset[]>;

/** Helpers used by the product catalogue */
export const assetHelpers = { runway, archive, editorial, CATALOGUE };
