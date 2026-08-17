// Shared collection-eligibility policy (client + server safe).
// "Collection" is only available when the cart contains ONLY products from the
// Plastic Seals and Barrier Seals categories. Every other product (cable ties,
// security bags, installation tools, etc.) is delivery-only.

export const COLLECTION_ELIGIBLE_SLUGS: ReadonlySet<string> = new Set([
  // Plastic Seals
  'suretite-230mm',
  'suretite-320mm',
  'suretite-barcoded',
  'twinlock',
  'twinlock-barcoded',
  'padlock-seal',
  'nylock-seal',
  // Barrier Seals
  'bolt-seal',
  'cable-seal-500mm',
  'abs-cable-lock',
  'cable-seal-300mm',
]);

export function isCollectionEligibleSlug(slug: string): boolean {
  return COLLECTION_ELIGIBLE_SLUGS.has(slug);
}
