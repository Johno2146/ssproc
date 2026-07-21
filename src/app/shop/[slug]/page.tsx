import { createClient } from "@libsql/client";
import ProductDetailClient from "./ProductDetailClient";
import { notFound } from "next/navigation";
import { productSpecs, quantityTiers, tierColours } from "@/lib/productData";

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
  const specs = productSpecs[slug];
  const tiers = quantityTiers[slug] || null;
  const tc = tierColours[slug] || undefined;

  return (
    <ProductDetailClient
      productId={row.id}
      name={row.name}
      price={Number(row.price)}
      unit={row.unit}
      imageUrl={row.imageUrl}
      minOrder={Number(row.minOrder)}
      colours={specs?.colours || []}
      tiers={tiers}
      tierColours={tc}
      weightKg={specs?.weightKg}
      lengthCm={specs?.lengthCm}
      widthCm={specs?.widthCm}
      heightCm={specs?.heightCm}
    />
  );
}
