import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

const PRODUCTS = [
  ["CT 100mm","ct-100mm","CT 100mm - PA66 (Nylon 6/6), 100 x 2.5 x 1.1 mm","Plastic Cable Ties",29.0,"Pack of 100",100],
  ["CT 150mm","ct-150mm","CT 150mm - PA66 (Nylon 6/6), 150 x 3.6 x 1.3 mm","Plastic Cable Ties",39.0,"Pack of 100",100],
  ["CT 200mm","ct-200mm","CT 200mm - PA66 (Nylon 6/6), 200 x 4.8 x 1.3 mm","Plastic Cable Ties",49.0,"Pack of 100",100],
  ["CT Slim 200mm","ct-slim-200mm","CT Slim 200mm - PA66 (Nylon 6/6), 200 x 3.6 x 1.1 mm","Plastic Cable Ties",39.0,"Pack of 100",100],
  ["CT Heavy Duty 200mm","ct-heavy-duty-200mm","CT Heavy Duty 200mm - PA66 (Nylon 6/6), 200 x 7.6 x 1.9 mm","Plastic Cable Ties",69.0,"Pack of 100",100],
  ["CT 300mm","ct-300mm","CT 300mm - PA66 (Nylon 6/6), 300 x 4.8 x 1.3 mm","Plastic Cable Ties",59.0,"Pack of 100",100],
  ["CT Heavy Duty 300mm","ct-heavy-duty-300mm","CT Heavy Duty 300mm - PA66 (Nylon 6/6), 300 x 7.6 x 1.9 mm","Plastic Cable Ties",89.0,"Pack of 100",100],
  ["CT 400mm","ct-400mm","CT 400mm - PA66 (Nylon 6/6), 400 x 4.8 x 1.3 mm","Plastic Cable Ties",69.0,"Pack of 100",100],
  ["CT Heavy Duty 400mm","ct-heavy-duty-400mm","CT Heavy Duty 400mm - PA66 (Nylon 6/6), 400 x 7.6 x 1.9 mm","Plastic Cable Ties",99.0,"Pack of 100",100],
  ["CT Heavy Duty 500mm","ct-heavy-duty-500mm","CT Heavy Duty 500mm - PA66 (Nylon 6/6), 500 x 7.6 x 1.9 mm","Plastic Cable Ties",119.0,"Pack of 100",100],
  ["CT Extra Heavy Duty 540mm","ct-extra-heavy-duty-540mm","CT Extra Heavy Duty 540mm - PA66 (Nylon 6/6), 540 x 13 x 2.3 mm","Plastic Cable Ties",149.0,"Pack of 50",50],
];

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL || "",
  authToken: process.env.TURSO_AUTH_TOKEN || "",
});

export async function GET() {
  try {
    // First delete all existing CT products
    await turso.execute({ sql: "DELETE FROM Product WHERE category = 'Plastic Cable Ties'" });
    
    // Then insert the new merged products
    const results = [];
    for (const [name, slug, description, category, price, unit, stock] of PRODUCTS) {
      await turso.execute({
        sql: "INSERT INTO Product (name, slug, description, category, price, unit, minOrder, stock, isActive, imageUrl, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, '', datetime('now'), datetime('now'))",
        args: [name, slug, description, category, price, unit, stock, stock],
      });
      results.push("Seeded: " + slug);
    }
    return NextResponse.json({ seeded: results, deleted: "All old CT products removed" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
