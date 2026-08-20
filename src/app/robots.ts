import type { MetadataRoute } from "next";
import { CANONICAL_BASE } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/auth/", "/checkout/", "/dashboard/", "/api/"],
    },
    sitemap: `${CANONICAL_BASE}/sitemap.xml`,
    host: CANONICAL_BASE,
  };
}
