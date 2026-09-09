import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@libsql/client";

// Metal Seals — heavy-duty metal strap seals (silver, no colour options).
// Sold per 1000. Price is NET (VAT added at display/checkout per catalog convention).
const PRODUCTS = [
  ["Metal Strap (Ball)", "metal-strap-ball", "Heavy-duty tamper-evident metal strap seal with ball locking mechanism, silver finish. Sold per 1000.", "Metal Seals", 1988.0, "Per 1000", 1000, 500],
  ["Metal Strap (Flat)", "metal-strap-flat", "Heavy-duty tamper-evident metal strap seal with flat locking mechanism, silver finish. Sold per 1000.", "Metal Seals", 1988.0, "Per 1000", 1000, 500],
];

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "",
  authToken: process.env.TURSO_AUTH_TOKEN || "",
});

export async function GET() {
  try {
    const results: string[] = [];
    for (const [name, slug, description, category, price, unit, minOrder, stock] of PRODUCTS) {
      const existing = await turso.execute({ sql: "SELECT id FROM Product WHERE slug = ?", args: [slug] });
      if (existing.rows.length > 0) {
        await turso.execute({
          sql: "UPDATE Product SET name = ?, description = ?, category = ?, price = ?, unit = ?, minOrder = ?, stock = ?, isActive = 1, updatedAt = datetime('now') WHERE slug = ?",
          args: [name, description, category, price, unit, minOrder, stock, slug],
        });
        results.push("Updated: " + slug);
      } else {
        await turso.execute({
          sql: "INSERT INTO Product (id, name, slug, description, category, price, unit, minOrder, stock, isActive, imageUrl, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, '', datetime('now'), datetime('now'))",
          args: [crypto.randomUUID(), name, slug, description, category, price, unit, minOrder, stock],
        });
        results.push("Seeded: " + slug);
      }
    }
    return NextResponse.json({ results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}