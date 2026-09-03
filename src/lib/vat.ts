// VAT-inclusive pricing helper (South Africa, 15%).
//
// IMPORTANT: this is a DISPLAY-ONLY helper. The source of truth for money is the
// NET price everywhere:
//   - quantityTiers / Product.price in the DB are NET (excl. VAT)
//   - the cart stores NET prices
//   - /api/checkout computes Order.total = Σ(net×qty) + 15% VAT and that exact
//     number goes to PayFast and is validated by the ITN (amount_gross ±0.01).
// Net money collected MUST NOT change — only customer-facing displays and the
// Google Merchant Center feed wrap net prices with withVat() and label them
// "incl. VAT".
export const VAT_RATE = 0.15;

/** Round a net price up to a 2-decimal VAT-inclusive price (banker-friendly round half up). */
export function withVat(net: number): number {
  return Math.round(net * (1 + VAT_RATE) * 100) / 100;
}

/** VAT content of a 2-decimal gross price (gross − net equivalent). */
export function vatOfGross(gross: number): number {
  return Math.round((gross - gross / (1 + VAT_RATE)) * 100) / 100;
}