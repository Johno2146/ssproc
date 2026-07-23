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
    const result = await client.execute("SELECT * FROM Product WHERE isActive = 1 ORDER BY CASE slug WHEN 'ct-100mm' THEN 1 WHEN 'ct-150mm' THEN 2 WHEN 'ct-slim-200mm' THEN 3 WHEN 'ct-200mm' THEN 4 WHEN 'ct-heavy-duty-200mm' THEN 5 WHEN 'ct-300mm' THEN 6 WHEN 'ct-heavy-duty-300mm' THEN 7 WHEN 'ct-400mm' THEN 8 WHEN 'ct-heavy-duty-400mm' THEN 9 WHEN 'ct-heavy-duty-500mm' THEN 10 WHEN 'ct-extra-heavy-duty-540mm' THEN 11
      WHEN 'ss-4-6-150mm' THEN 12
      WHEN 'ss-4-6-200mm' THEN 13
      WHEN 'ss-4-6-250mm' THEN 14
      WHEN 'ss-4-6-300mm' THEN 15
      WHEN 'ss-4-6-350mm' THEN 16
      WHEN 'ss-4-6-400mm' THEN 17
      WHEN 'ss-4-6-450mm' THEN 18
      WHEN 'ss-4-6-500mm' THEN 19
      WHEN 'ss-4-6-550mm' THEN 20
      WHEN 'ss-4-6-600mm' THEN 21
      WHEN 'ss-7-9-200mm' THEN 22
      WHEN 'ss-7-9-250mm' THEN 23
      WHEN 'ss-7-9-300mm' THEN 24
      WHEN 'ss-7-9-350mm' THEN 25
      WHEN 'ss-7-9-400mm' THEN 26
      WHEN 'ss-7-9-450mm' THEN 27
      WHEN 'ss-7-9-500mm' THEN 28
      WHEN 'ss-7-9-550mm' THEN 29
      WHEN 'ss-7-9-600mm' THEN 30
      WHEN 'ss-7-9-650mm' THEN 31
      WHEN 'ss-7-9-700mm' THEN 32
      WHEN 'ss-7-9-750mm' THEN 33
      WHEN 'ss-7-9-800mm' THEN 34
      WHEN 'ss-installation-tool' THEN 35
      ELSE 100 END, createdAt DESC");
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

