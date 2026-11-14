import type { MetadataRoute } from "next";
import { CANONICAL_BASE } from "@/lib/seo";

// Paths that must never be crawled. Kept identical for every group so adding an
// explicit AI-crawler group never opens something the wildcard rule closed.
const DISALLOW = ["/auth/", "/checkout/", "/dashboard/", "/api/"];

// Explicit allow groups for AI/answer-engine crawlers and Bing (owner request).
const NAMED_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ClaudeBot",
  "PerplexityBot",
  "Google-Extended",
  "BingBot",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOW,
      },
      ...NAMED_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${CANONICAL_BASE}/sitemap.xml`,
    host: CANONICAL_BASE,
  };
}
