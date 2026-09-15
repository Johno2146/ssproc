import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@libsql/client";
// Upserts the "Plastic tags" category products into the LIVE Turso catalog
// (owner 2026-09-14). Price = MIN quantity-tier NET price (established rule
// since commit 58cbb10 — the shop/product pages use quantityTiers from
// src/lib/productData.ts as source of truth; Product.price is the "from"
// fallback only). Safe to re-run: upsert by slug, UUID ids, idempotent.
const PRODUCTS = [
  ["Motag", "motag-35x75", "Plastic tag 35 x 75 mm. Printed or unprinted, 200 per box. Colours: Clear, White, Yellow, Orange, Red, Pink, Lilac, Blue, Green, Silver, Florescent Yellow, Magenta.", "Plastic tags", 390.0, "200 box", 200, 100, "/assets/Motag printed.jpg"],
  ["Tag 62 x 100mm", "tag-62x100", "Unprinted plastic tag 62 x 100 mm. Sold per 1000. Colours: Clear, White, Yellow, Orange, Red, Pink, Lilac, Blue, Green, Silver, Florescent Yellow, Magenta. Contact sales for printing options.", "Plastic tags", 1630.0, "Per 1000", 1000, 100, "/assets/62x100.png"],
  ["Tag 62 x 125mm", "tag-62x125", "Unprinted plastic tag 62 x 125 mm. Sold per 1000. Colours: Clear, White, Yellow, Orange, Red, Pink, Lilac, Blue, Green, Silver, Florescent Yellow, Magenta. Contact sales for printing options.", "Plastic tags", 1790.0, "Per 1000", 1000, 100, "/assets/62x125.png"],
  ["Tag 62 x 150mm", "tag-62x150", "Unprinted plastic tag 62 x 150 mm. Sold per 1000. Colours: Clear, White, Yellow, Orange, Red, Pink, Lilac, Blue, Green, Silver, Florescent Yellow, Magenta. Contact sales for printing options.", "Plastic tags", 2010.0, "Per 1000", 1000, 100, "/assets/62x150.png"],
  ["Tag 75 x 150mm", "tag-75x150", "Unprinted plastic tag 75 x 150 mm. Sold per 1000. Colours: Clear, White, Yellow, Orange, Red, Pink, Lilac, Blue, Green, Silver, Florescent Yellow, Magenta. Contact sales for printing options.", "Plastic tags", 2350.0, "Per 1000", 1000, 100, "/assets/75x150.png"],
];
const turso = createClient({
  url: process.env.TURSO_DATABASE_URL || "",
  authToken: process.env.TURSO_AUTH_TOKEN || "",
});
export async function GET() {
  try {
    const results: string[] = [];
    for (const [name, slug, description, category, price, unit, minOrder, stock, imageUrl] of PRODUCTS) {
      const existing = await turso.execute({ sql: "SELECT id FROM Product WHERE slug = ?", args: [slug] });
      if (existing.rows.length > 0) {
        await turso.execute({
          sql: "UPDATE Product SET name = ?, description = ?, category = ?, price = ?, unit = ?, minOrder = ?, stock = ?, imageUrl = ?, isActive = 1, updatedAt = datetime('now') WHERE slug = ?",
          args: [name, description, category, price, unit, minOrder, stock, imageUrl, slug],
        });
        results.push("Updated: " + slug);
      } else {
        await turso.execute({
          sql: "INSERT INTO Product (id, name, slug, description, category, price, unit, minOrder, stock, isActive, imageUrl, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, datetime('now'), datetime('now'))",
          args: [crypto.randomUUID(), name, slug, description, category, price, unit, minOrder, stock, imageUrl],
        });
        results.push("Seeded: " + slug);
      }
    }
    return NextResponse.json({ results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}