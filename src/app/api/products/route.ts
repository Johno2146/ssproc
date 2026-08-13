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
    const result = await client.execute(
      "SELECT * FROM Product WHERE isActive = 1 ORDER BY CASE slug " +
      // 1. Plastic Seals
      "WHEN 'suretite-320mm' THEN 0 WHEN 'suretite-230mm' THEN 1 WHEN 'suretite-barcoded' THEN 2 WHEN 'twinlock' THEN 3 WHEN 'twinlock-barcoded' THEN 4 WHEN 'padlock-seal' THEN 5 WHEN 'nylock-seal' THEN 6 WHEN 'suregas-seal' THEN 7 " +
      // 2. Barrier Seals
      "WHEN 'bolt-seal' THEN 8 WHEN 'cable-lock-500mm' THEN 9 WHEN 'cable-seal-300mm' THEN 10 WHEN 'cable-seal-500mm' THEN 11 WHEN 'abs-cable-lock' THEN 12 " +
      // 3. Plastic Cable Ties
      "WHEN 'heavy-duty-double-zip-tie-handcuff' THEN 13 WHEN 'ct-100mm' THEN 14 WHEN 'ct-150mm' THEN 15 WHEN 'ct-slim-200mm' THEN 16 WHEN 'ct-200mm' THEN 17 WHEN 'ct-heavy-duty-200mm' THEN 18 WHEN 'ct-300mm' THEN 19 WHEN 'ct-heavy-duty-300mm' THEN 20 WHEN 'ct-400mm' THEN 21 WHEN 'ct-heavy-duty-400mm' THEN 22 WHEN 'ct-heavy-duty-500mm' THEN 23 WHEN 'ct-extra-heavy-duty-540mm' THEN 24 " +
      // 4. Stainless Steel Cable Ties
      "WHEN 'ss-4-6-150mm' THEN 25 WHEN 'ss-4-6-200mm' THEN 26 WHEN 'ss-4-6-250mm' THEN 27 WHEN 'ss-4-6-300mm' THEN 28 WHEN 'ss-4-6-350mm' THEN 29 WHEN 'ss-4-6-400mm' THEN 30 WHEN 'ss-4-6-450mm' THEN 31 WHEN 'ss-4-6-500mm' THEN 32 WHEN 'ss-4-6-550mm' THEN 33 WHEN 'ss-4-6-600mm' THEN 34 " +
      "WHEN 'ss-7-9-200mm' THEN 35 WHEN 'ss-7-9-250mm' THEN 36 WHEN 'ss-7-9-300mm' THEN 37 WHEN 'ss-7-9-350mm' THEN 38 WHEN 'ss-7-9-400mm' THEN 39 WHEN 'ss-7-9-450mm' THEN 40 WHEN 'ss-7-9-500mm' THEN 41 WHEN 'ss-7-9-550mm' THEN 42 WHEN 'ss-7-9-600mm' THEN 43 WHEN 'ss-7-9-650mm' THEN 44 WHEN 'ss-7-9-700mm' THEN 45 WHEN 'ss-7-9-750mm' THEN 46 WHEN 'ss-7-9-800mm' THEN 47 WHEN 'ss-installation-tool' THEN 48 " +
      "ELSE 100 END, createdAt DESC"
    );
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

