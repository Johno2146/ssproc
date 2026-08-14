import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

const PRODUCTS = [
  ["Cash Bags", "cash-bags", "Heavy-duty tamper-evident cash bags. Sizes: 26x26cm, 28x35cm, 38x40cm. Colours: Black, Blue, Red, Yellow. Sold per bag.", "Security Bags", 69.0, "Each", 1, 500],
  ["Till Bag", "till-bag", "Heavy-duty tamper-evident till bag, 46 x 36 x 10 cm. Colours: Black, Blue, Red, Yellow. Sold per bag.", "Security Bags", 195.0, "Each", 1, 500],
  ["Envopoly", "envopoly", "One-time use tamper-evident seal for security bags. Per 1000, white only.", "Security Bags", 171.0, "Per 1000", 1000, 500],
];

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL || "",
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
          sql: "INSERT INTO Product (name, slug, description, category, price, unit, minOrder, stock, isActive, imageUrl, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, '', datetime('now'), datetime('now'))",
          args: [name, slug, description, category, price, unit, minOrder, stock],
        });
        results.push("Seeded: " + slug);
      }
    }
    return NextResponse.json({ results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
