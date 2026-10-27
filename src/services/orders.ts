/**
 * Order + inquiry submission.
 *
 * PROTOTYPE: nothing is transmitted. `submitOrder` returns a DEMO reference
 * and status `demo-not-submitted`; no payment is taken. Placed demo orders are
 * kept in this browser (localStorage) so the confirmation page and the invoice
 * can be reopened, and `simulatePayment` can mark one as paid for a
 * presentation walk-through. Every invoice is watermarked as a demo.
 *
 * Production path: POST the SalesOrderDraft to BRK middleware → middleware
 * creates the ECOUNT sales order and, once the payment gateway confirms, the
 * invoice in Mekari Jurnal; status is read back via `getOrderStatus`.
 */
import type { InquiryDraft, SalesOrderDraft, SalesOrderResult } from '../types/commerce';

export interface OrderService {
  submitOrder(draft: SalesOrderDraft): Promise<SalesOrderResult>;
  getOrderStatus(reference: string): Promise<{ reference: string; status: string; tracking?: string }>;
  submitInquiry(draft: InquiryDraft): Promise<{ reference: string }>;
}

/** A placed demo order, as shown on the confirmation page and the invoice. */
export interface PlacedOrder extends SalesOrderResult {
  draft: SalesOrderDraft;
  /** Sequential invoice number, e.g. INV/2026/10/BRK/00001 */
  invoiceNumber: string;
  payment: { state: 'awaiting' | 'paid'; paidAt?: string; reference?: string };
}

const ORDERS_KEY = 'brk.orders.v1';
const SEQ_KEY = 'brk.invoiceSeq.v1';
const LAST_KEY = 'brk.lastOrder.v1';
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const ref = (prefix: string) => `${prefix}-${Date.now().toString(36).toUpperCase().slice(-6)}`;

function readAll(): Record<string, PlacedOrder> {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) ?? '{}') as Record<string, PlacedOrder>;
  } catch {
    return {};
  }
}
function writeAll(all: Record<string, PlacedOrder>) {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(all));
  } catch {
    /* storage unavailable — invoice links won't survive a reload */
  }
}

function nextInvoiceNumber(date: Date): string {
  let n = 1;
  try {
    n = Number(localStorage.getItem(SEQ_KEY) ?? '0') + 1;
    localStorage.setItem(SEQ_KEY, String(n));
  } catch {
    n = Math.floor(Math.random() * 9000) + 1000;
  }
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `INV/${date.getFullYear()}/${mm}/BRK/${String(n).padStart(5, '0')}`;
}

export function getOrder(reference: string): PlacedOrder | null {
  return readAll()[reference] ?? null;
}

export function readLastOrder(): PlacedOrder | null {
  try {
    const last = localStorage.getItem(LAST_KEY);
    return last ? getOrder(last) : null;
  } catch {
    return null;
  }
}

/** Presentation helper: mark a demo order as paid (no money moves). */
export function simulatePayment(reference: string): PlacedOrder | null {
  const all = readAll();
  const o = all[reference];
  if (!o) return null;
  o.payment = { state: 'paid', paidAt: new Date().toISOString(), reference: ref('PAY-DEMO') };
  writeAll(all);
  return o;
}

export const demoOrderService: OrderService = {
  async submitOrder(draft) {
    await delay(900);
    const now = new Date();
    const result: SalesOrderResult = { reference: ref('DEMO'), status: 'demo-not-submitted', createdAt: now.toISOString() };
    const all = readAll();
    all[result.reference] = { ...result, draft, invoiceNumber: nextInvoiceNumber(now), payment: { state: 'awaiting' } };
    writeAll(all);
    try {
      localStorage.setItem(LAST_KEY, result.reference);
    } catch {
      /* ignore */
    }
    return result;
  },
  async getOrderStatus(reference) {
    const o = getOrder(reference);
    return { reference, status: o?.payment.state === 'paid' ? 'paid-demo' : 'demo-not-submitted' };
  },
  async submitInquiry() {
    await delay(700);
    return { reference: ref('ENQ-DEMO') };
  },
};

export const orders: OrderService = demoOrderService;
