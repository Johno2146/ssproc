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
    const result = await client.execute("SELECT * FROM Product WHERE isActive = 1 ORDER BY createdAt DESC");
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
