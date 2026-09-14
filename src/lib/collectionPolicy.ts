// Collection policy — OWNER RULE (2026-08-17, updated 2026-09-14):
// Collection is available for EVERYTHING except cable ties AND plastic tags.
// Categories in DELIVERY_ONLY_CATEGORIES are delivery-only: "Plastic Cable
// Ties" + "Stainless Steel Cable Ties" (original 2026-08-17 rule) and
// "Plastic tags" (owner 2026-09-14 — plastic tags are delivery-only like
// cable ties, no free collection). All seals (plastic, bolt, cable, metal),
// security bags and other products remain collection-eligible.
// Category-based so newly added products are covered automatically.
// Shared by the client (CheckoutPage) and the server (POST /api/checkout)
// so the two can't drift.

export const DELIVERY_ONLY_CATEGORIES: ReadonlySet<string> = new Set([
  'Plastic Cable Ties',
  'Stainless Steel Cable Ties',
  'Plastic tags',
]);

export function isDeliveryOnlyCategory(category: string): boolean {
  return DELIVERY_ONLY_CATEGORIES.has(category);
}

export function isCollectableCategory(category: string): boolean {
  return !isDeliveryOnlyCategory(category);
}
