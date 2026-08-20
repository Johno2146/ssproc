import type { MetadataRoute } from "next";
import { createClient } from "@libsql/client";
import { CANONICAL_BASE } from "@/lib/seo";

export const dynamic = "force-dynamic";

// Core public pages (sitemap uses the canonical www base; see src/lib/seo.ts).
const corePages: MetadataRoute.Sitemap = [
  { url: `${CANONICAL_BASE}/`, changeFrequency: "weekly", priority: 1.0 },
  { url: `${CANONICAL_BASE}/shop`, changeFrequency: "daily", priority: 0.9 },
  { url: `${CANONICAL_BASE}/about`, changeFrequency: "monthly", priority: 0.6 },
  { url: `${CANONICAL_BASE}/contact`, changeFrequency: "monthly", priority: 0.6 },
  { url: `${CANONICAL_BASE}/services`, changeFrequency: "monthly", priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Append every active product URL from the production Turso DB. If the DB is
  // unreachable (e.g. a preview deploy without secrets), gracefully fall back to
  // the core pages so sitemap.xml never 500s.
  try {
    const client = createClient({
      url: process.env.DATABASE_URL || "",
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    const result = await client.execute(
      "SELECT slug, updatedAt FROM Product WHERE isActive = 1"
    );
    const productEntries: MetadataRoute.Sitemap = result.rows.map((row: any) => ({
      url: `${CANONICAL_BASE}/shop/${row.slug}`,
      lastModified: row.updatedAt ? new Date(row.updatedAt) : undefined,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
    return [...corePages, ...productEntries];
  } catch (err) {
    console.warn("[sitemap] DB unavailable, returning core pages only:", err);
    return corePages;
  }
}
