import { getClient } from "@/lib/db";
import { quantityTiers } from "@/lib/productData";
import { productImages } from "@/lib/productImages";
import { CANONICAL_BASE, SITE_NAME } from "@/lib/seo";

// Google Merchant Center TXT (tab-separated) product feed.
// Stable URL: https://www.ssproc.co.za/feed/products.txt
// Owner pastes this URL into Merchant Center → Products → Feeds → "From a
// file" → URL. force-dynamic: every request reads the live DB (no ISR/CDN
// cache) so Google's fetcher always sees current products, prices and stock.
//
// DB access note: the live production DB is Turso/libsql via src/lib/db.ts —
// the same pattern every other working route uses. Prisma cannot be used in
// prod here: prisma/schema.prisma hardcodes url=file:./dev.db, which is not
// deployed to Vercel, so Prisma-backed routes 500 in production.
export const dynamic = "force-dynamic";

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

const HEADER =
  "id\ttitle\tdescription\tlink\timage_link\tprice\tavailability\tcondition\tbrand\tgoogle_product_category\tidentifier_exists";

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/** TSV field: collapse tabs/newlines, double embedded quotes, wrap in quotes. */
function tsv(s: string): string {
  return '"' + s.replace(/[\t\n\r]+/g, " ").replace(/"/g, '""') + '"';
}

/** Google's title limit is 150 chars. */
function feedTitle(name: string): string {
  return name.length <= 150 ? name : name.slice(0, 147) + "...";
}

/** Real brand where the catalog documents one (PDF spec data); store brand otherwise. */
function feedBrand(slug: string, name: string): string {
  const hay = `${slug} ${name}`.toLowerCase();
  if (hay.includes("suretite")) return "Suretite";
  if (hay.includes("twinlock")) return "Twinlock";
  return SITE_NAME;
}

/** Min quantity-tier price (Shop's "From R..." logic); DB price fallback. */
function feedPrice(slug: string, dbPrice: number): number {
  const tiers = quantityTiers[slug];
  if (tiers && tiers.length) return Math.min(...tiers.map((t) => t.price));
  return dbPrice;
}

/** Description: HTML stripped, whitespace collapsed, always > 30 chars, no invented claims. */
function feedDescription(p: { name: string; description: string | null }): string {
  let d = stripHtml(p.description || `${p.name} security seal`);
  if (d.length < 30) d = `${d}. Available from ${SITE_NAME} in South Africa.`;
  return d;
}

export async function GET() {
  let rows: ProductRow[] = [];
  try {
    const client = getClient();
    const result = await client.execute("SELECT * FROM Product WHERE isActive = 1");
    rows = result.rows as unknown as ProductRow[];
  } catch (err) {
    console.error("[feed/products.txt] DB unavailable:", err);
    return new Response("Product feed temporarily unavailable", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const lines = rows.map((p) => {
    const price = feedPrice(p.slug, Number(p.price));
    const image = productImages[p.slug] || p.imageUrl || "";
    const availability = Number(p.stock) > 0 ? "in stock" : "out of stock";
    return [
      p.id,
      tsv(feedTitle(p.name)),
      tsv(feedDescription(p)),
      `${CANONICAL_BASE}/shop/${p.slug}`,
      image ? `${CANONICAL_BASE}${image}` : "",
      `${price.toFixed(2)} ZAR`,
      availability,
      "new",
      feedBrand(p.slug, p.name),
      "", // google_product_category — intentionally empty: catalog is heterogeneous
      // (bolt seals, cable ties, security bags) and we do not invent taxonomy IDs.
      "no",
    ].join("\t");
  });

  const body = [HEADER, ...lines].join("\n") + "\n";
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}