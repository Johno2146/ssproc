import { createClient } from "@libsql/client";
import { quantityTiers } from "@/lib/productData";
import { productImages } from "@/lib/productImages";
import { CANONICAL_BASE, SITE_NAME } from "@/lib/seo";

// Google Merchant Center product feed (Google Shopping XML, g: namespace).
// Stable URL: https://www.ssproc.co.za/feed.xml
// Owner pastes this URL into Merchant Center → Products → Feeds → "From a file"
// → URL. Regenerated from the live product DB (max 1-hour cache).
export const revalidate = 3600;

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  price: number | string;
  unit: string;
  stock: number | string;
  imageUrl: string | null;
  isActive: number | boolean;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Min tier price is the display/order source of truth (see the price fix); fall back to DB price. */
function feedPrice(slug: string, dbPrice: number): number {
  const tiers = quantityTiers[slug];
  if (tiers && tiers.length) return Math.min(...tiers.map((t) => t.price));
  return dbPrice;
}

export async function GET() {
  let rows: ProductRow[] = [];
  try {
    const client = createClient({
      url: process.env.DATABASE_URL || "",
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    const result = await client.execute("SELECT * FROM Product WHERE isActive = 1");
    rows = result.rows as unknown as ProductRow[];
  } catch (err) {
    console.error("[feed.xml] DB unavailable:", err);
    return new Response("Product feed temporarily unavailable", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=UTF-8" },
    });
  }

  const items = rows
    .map((p) => {
      const price = feedPrice(p.slug, Number(p.price));
      const image = productImages[p.slug] || p.imageUrl || null;
      const availability = Number(p.stock) > 0 ? "in stock" : "out of stock";
      return `  <item>
    <g:id>${escapeXml(p.slug)}</g:id>
    <g:title>${escapeXml(p.name)}</g:title>
    <g:description>${escapeXml((p.description || `${p.name} security seal`).replace(/\s+/g, " ").trim())}</g:description>
    <g:link>${CANONICAL_BASE}/shop/${escapeXml(p.slug)}</g:link>
    ${image ? `<g:image_link>${CANONICAL_BASE}${escapeXml(image)}</g:image_link>` : ""}
    <g:availability>${availability}</g:availability>
    <g:price>${price.toFixed(2)} ZAR</g:price>
    <g:condition>new</g:condition>
    <g:brand>${escapeXml(SITE_NAME)}</g:brand>
    <g:identifier_exists>no</g:identifier_exists>
    <g:product_type>${escapeXml(p.category)}</g:product_type>
  </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(SITE_NAME)} Products</title>
    <link>${CANONICAL_BASE}</link>
    <description>Premium security seals, tamper-evident seals, cable ties and security bags for logistics and industrial sectors in South Africa.</description>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=UTF-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}