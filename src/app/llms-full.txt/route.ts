import { getShopProducts, CATEGORY_ORDER, type CatalogProduct } from "@/lib/catalog";
import { buildLlmsFullTxt } from "@/lib/llms";

export const dynamic = "force-dynamic";

export async function GET() {
  let products: CatalogProduct[] = [];
  try {
    products = await getShopProducts();
  } catch {
    // Never fail the file: the company/pages sections are still valid without the catalogue.
  }
  const body = buildLlmsFullTxt(products, CATEGORY_ORDER);
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
