// Pricing helper — owner's final prices are the ONLY prices, no VAT mark-up.
//
// Owner decision (2026-09-09): the site displays and charges exactly the
// owner's updated price-list numbers (the NET values in productData.ts / DB).
// No VAT is added anywhere — displayed price == charged price == feed price.
// Historical orders are untouched.
//
// withVat() and vatOfGross() are kept as identity/zero so every existing call
// site continues to compile and behave correctly with VAT_RATE = 0.
export const VAT_RATE = 0;
/** Returns the price unchanged (no VAT mark-up — identity). */
export function withVat(net: number): number {
  return net;
}
/** VAT content is always zero (no VAT mark-up). */
export function vatOfGross(gross: number): number {
  return 0;
}