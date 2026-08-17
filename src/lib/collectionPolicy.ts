// Collection policy — OWNER RULE (2026-08-17):
// Collection is available for EVERYTHING except cable ties. Only products in
// the "Plastic Cable Ties" and "Stainless Steel Cable Ties" categories are
// delivery-only. Security bags (cash-bags, till-bag, envopoly) and ALL seals
// (plastic, bolt, cable) are collection-eligible.
// Category-based so newly added products are covered automatically.
// Shared by the client (CheckoutPage) and the server (POST /api/checkout)
// so the two can't drift.

export const DELIVERY_ONLY_CATEGORIES: ReadonlySet<string> = new Set([
  'Plastic Cable Ties',
  'Stainless Steel Cable Ties',
]);

export function isDeliveryOnlyCategory(category: string): boolean {
  return DELIVERY_ONLY_CATEGORIES.has(category);
}

export function isCollectableCategory(category: string): boolean {
  return !isDeliveryOnlyCategory(category);
}
