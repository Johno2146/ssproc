import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

function getClient() {
  return createClient({
    url: process.env.DATABASE_URL || "",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

export async function GET() {
  try {
    const client = getClient();
    const result = await client.execute("SELECT * FROM Product WHERE isActive = 1 ORDER BY CASE slug WHEN 'ct-100mm' THEN 1 WHEN 'ct-150mm' THEN 2 WHEN 'ct-slim-200mm' THEN 3 WHEN 'ct-200mm' THEN 4 WHEN 'ct-heavy-duty-200mm' THEN 5 WHEN 'ct-300mm' THEN 6 WHEN 'ct-heavy-duty-300mm' THEN 7 WHEN 'ct-400mm' THEN 8 WHEN 'ct-heavy-duty-400mm' THEN 9 WHEN 'ct-heavy-duty-500mm' THEN 10 WHEN 'ct-extra-heavy-duty-540mm' THEN 11 ELSE 100 END, createdAt DESC");
    const products = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      category: row.category,
      price: row.price,
      unit: row.unit,
      minOrder: row.minOrder,
      stock: row.stock,
      imageUrl: row.imageUrl,
      isActive: row.isActive,
    }));
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", detail: error.message },
      { status: 500 }
    );
  }
}

