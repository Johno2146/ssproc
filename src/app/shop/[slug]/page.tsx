import { createClient } from "@libsql/client";
import ProductDetailClient from "./ProductDetailClient";
import { notFound } from "next/navigation";

function getClient() {
  return createClient({
    url: process.env.DATABASE_URL || "",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

export default async function ProductPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const client = getClient();
  const result = await client.execute({
    sql: "SELECT * FROM Product WHERE slug = ? AND isActive = 1",
    args: [slug],
  });

  if (result.rows.length === 0) notFound();

  const row = result.rows[0] as any;
  const product = {
    id: row.id ?? "unknown",
    name: row.name ?? "",
    slug: row.slug ?? "",
    description: row.description ?? "",
    category: row.category ?? "",
    price: Number(row.price ?? 0),
    unit: row.unit ?? "each",
    minOrder: Number(row.minOrder ?? 1),
    stock: Number(row.stock ?? 0),
    imageUrl: row.imageUrl ?? null,
    isActive: row.isActive ? true : false,
  };

  return <ProductDetailClient product={product} />;
}
