// Flat-rate delivery — OWNER RULE (2026-09-29). No external quote calls anywhere.
//
// Delivery is a flat fee computed purely from the cart's own line items:
//   - R150 standard delivery per order (1–5 boxes, fewer than 1000 seal pieces).
//   - R300 when the order contains >= 1000 SEAL pieces. Seal count is the sum
//     over cart items in the SEAL categories of (quantity × pack size where the
//     pack size comes from the tier's unit, e.g. "50 pack" = 50 pieces per box).
//     Cable ties, plastic tags and security bags are NOT seals.
//   - Orders over 5 boxes (box count = sum of pack quantities) get no online
//     delivery: the customer must request a custom shipping quote.
// Collection is unchanged (free, subject to collectionPolicy.ts).
//
// This module is imported by BOTH the client (CheckoutPage preview) and the
// server (POST /api/checkout enforcement) so the two can't drift. It is pure —
// no server-only deps, no network access.

export const FLAT_RATE_STANDARD = 150;
export const FLAT_RATE_BULK = 300;
export const BULK_SEAL_PIECE_COUNT = 1000;
export const MAX_DELIVERY_BOXES = 5;

/** Categories whose pieces count toward the 1000-seal bulk threshold. */
export const SEAL_CATEGORIES: ReadonlySet<string> = new Set([
  'Plastic Seals',
  'Bolt Seals',
  'Cable Seals',
  'Metal Seals',
]);

export const FLAT_RATE_SERVICE_STANDARD = 'Standard';
export const FLAT_RATE_SERVICE_BULK = 'Bulk (1000+ seals)';
export const FLAT_RATE_PROVIDER = 'Flat Rate';

export const BULK_ORDER_MESSAGE =
  'Orders over 5 boxes need a custom shipping quote — email sales@ssproc.co.za or use the contact form.';

export interface FlatShippingLine {
  /** Product category (e.g. "Plastic Seals"). Non-seal categories don't count toward the bulk fee. */
  category?: string;
  /** Pieces per pack/box (e.g. 50 for a "50 pack"). Only seals use this. */
  packSize?: number;
  /** Number of packs/boxes ordered. */
  quantity: number;
}

export interface FlatShippingResult {
  boxCount: number;
  sealCount: number;
  shippingCost: number;
  /** 'Standard' | 'Bulk (1000+ seals)' when delivery is allowed, else null. */
  shippingService: string | null;
  /** Set when delivery is not available (over 5 boxes). Null when delivery is allowed. */
  error: string | null;
}

/** Extract the pack size from a tier unit string: "50 pack" → 50, "200 box" → 200, "Each" → 0. */
export function parsePackSize(unit: string | null | undefined): number {
  const m = String(unit ?? '').match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

/** Pure flat-rate computation shared by the client preview and the server. */
export function computeFlatShipping(lines: FlatShippingLine[]): FlatShippingResult {
  const safeLines = Array.isArray(lines) ? lines : [];
  const boxCount = safeLines.reduce(
    (sum, l) => sum + Math.max(1, Math.floor(Number(l?.quantity) || 0)),
    0
  );
  const sealCount = safeLines
    .filter((l) => l && SEAL_CATEGORIES.has(l.category || ''))
    .reduce((sum, l) => sum + Math.max(1, Math.floor(Number(l.quantity) || 0)) * Math.max(0, Number(l.packSize) || 0), 0);

  if (boxCount > MAX_DELIVERY_BOXES) {
    return {
      boxCount,
      sealCount,
      shippingCost: 0,
      shippingService: null,
      error: BULK_ORDER_MESSAGE,
    };
  }

  const bulk = sealCount >= BULK_SEAL_PIECE_COUNT;
  return {
    boxCount,
    sealCount,
    shippingCost: bulk ? FLAT_RATE_BULK : FLAT_RATE_STANDARD,
    shippingService: bulk ? FLAT_RATE_SERVICE_BULK : FLAT_RATE_SERVICE_STANDARD,
    error: null,
  };
}