/**
 * Checkout configuration — SAMPLE values for the prototype.
 * Couriers, rates, promo codes and the WhatsApp number are placeholders;
 * confirm with BRK operations before launch. No payment is ever processed.
 */
import { commerceRules } from './site';

/** Demo WhatsApp number used by the order-confirmation button (NOT BRK's real line). */
export const DEMO_WHATSAPP = '6280000000000';

export const GIFT_WRAP_PRICE = 50_000;

export interface ShippingOption {
  id: 'standard' | 'express' | 'pickup-bintaro' | 'pickup-solo';
  method: 'standard' | 'express' | 'pickup';
  label: string;
  detail: string;
  eta: string;
  price: number;
  /** Free above the free-shipping threshold */
  freeOverThreshold?: boolean;
}

export const SHIPPING_OPTIONS: ShippingOption[] = [
  { id: 'standard', method: 'standard', label: 'Regular', detail: 'JNE / J&T Reguler', eta: '2–4 working days', price: commerceRules.shippingRates.standard, freeOverThreshold: true },
  { id: 'express', method: 'express', label: 'Express', detail: 'SiCepat BEST', eta: '1–2 working days', price: commerceRules.shippingRates.express },
  { id: 'pickup-bintaro', method: 'pickup', label: 'Pick up — Bintaro', detail: 'Showroom & Head Office, Bintaro Jaya', eta: 'Ready in 1 working day', price: 0 },
  { id: 'pickup-solo', method: 'pickup', label: 'Pick up — Solo', detail: 'Showroom Solo, Keprabon Wetan', eta: 'Ready in 1 working day', price: 0 },
];

export interface PaymentOption {
  id: 'va' | 'qris' | 'ewallet' | 'card';
  label: string;
  detail: string;
  channels?: string[];
}

export const PAYMENT_OPTIONS: PaymentOption[] = [
  { id: 'va', label: 'Bank transfer (Virtual Account)', detail: 'Pay from any banking app', channels: ['BCA', 'Mandiri', 'BNI', 'BRI'] },
  { id: 'qris', label: 'QRIS', detail: 'Scan with any bank or e-wallet app' },
  { id: 'ewallet', label: 'E-wallet', detail: 'Pay in your wallet app', channels: ['GoPay', 'OVO', 'ShopeePay', 'DANA'] },
  { id: 'card', label: 'Credit / debit card', detail: 'Visa, Mastercard, JCB — entered on the payment page' },
];

/** Demo promo codes */
export const PROMO_CODES: Record<string, { label: string; percent?: number; amount?: number; freeShipping?: boolean }> = {
  BATIK10: { label: '10% off', percent: 10 },
  WELCOME50: { label: 'Rp 50.000 off', amount: 50_000 },
  ONGKIRFREE: { label: 'Free regular & express shipping', freeShipping: true },
};

/** Sample regions (subset) for the address form. */
export const REGIONS: Record<string, string[]> = {
  'DKI Jakarta': ['Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Barat', 'Jakarta Timur', 'Jakarta Utara'],
  Banten: ['Tangerang Selatan', 'Kota Tangerang', 'Kabupaten Tangerang', 'Serang', 'Cilegon'],
  'Jawa Barat': ['Bandung', 'Bekasi', 'Bogor', 'Depok', 'Cirebon'],
  'Jawa Tengah': ['Surakarta (Solo)', 'Semarang', 'Pekalongan', 'Magelang', 'Klaten'],
  'DI Yogyakarta': ['Yogyakarta', 'Sleman', 'Bantul'],
  'Jawa Timur': ['Surabaya', 'Malang', 'Sidoarjo', 'Kediri'],
  Bali: ['Denpasar', 'Badung', 'Gianyar'],
  'Sumatera Utara': ['Medan', 'Binjai'],
  'Sulawesi Selatan': ['Makassar', 'Gowa'],
};

export interface Totals {
  subtotal: number;
  discount: number;
  shipping: number;
  giftWrap: number;
  total: number;
  freeShippingApplied: boolean;
}

export function computeTotals(subtotal: number, shipping: ShippingOption, promoCode: string | null, giftWrap: boolean): Totals {
  const promo = promoCode ? PROMO_CODES[promoCode] : undefined;
  const discount = Math.min(subtotal, promo?.percent ? Math.round((subtotal * promo.percent) / 100) : (promo?.amount ?? 0));
  const freeByThreshold = !!shipping.freeOverThreshold && subtotal >= commerceRules.freeShippingThreshold;
  const freeByPromo = !!promo?.freeShipping && shipping.method !== 'pickup';
  const shippingCost = freeByThreshold || freeByPromo ? 0 : shipping.price;
  const wrap = giftWrap ? GIFT_WRAP_PRICE : 0;
  return {
    subtotal,
    discount,
    shipping: shippingCost,
    giftWrap: wrap,
    total: Math.max(0, subtotal - discount + shippingCost + wrap),
    freeShippingApplied: (freeByThreshold || freeByPromo) && shipping.price > 0,
  };
}
