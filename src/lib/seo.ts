import type { Metadata } from "next";

/**
 * Shared technical-SEO helpers for Sealed & Secured.
 *
 * CANONICAL_BASE is the single source of truth for every public URL we emit in
 * metadata/sitemap/JSON-LD. It MUST point at the canonical www host so nothing
 * ever references the redirecting apex (https://ssproc.co.za 308s to www, and
 * some crawlers/consumers do not follow redirects). This mirrors the established
 * canonical-normalization convention in src/app/api/checkout/route.ts.
 */
export const CANONICAL_BASE = "https://www.ssproc.co.za";
export const SITE_NAME = "Sealed & Secured";
export const DEFAULT_OG_IMAGE = `${CANONICAL_BASE}/assets/logo.png`;
export const DEFAULT_DESCRIPTION =
  "Premium security seal, tamper-evident and cable tie solutions for logistics and industrial sectors across South Africa. Buy online with secure PayFast payment and real-time order tracking.";
export const CONTACT_PHONE = "+27 10 555 0114";

/** Resolve any path (or absolute URL) to an absolute URL under the canonical base. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${CANONICAL_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

export interface BuildMetadataArgs {
  /** Full <title> for the page (independently meaningful, e.g. "Security Seals | Sealed & Secured"). */
  title: string;
  description: string;
  /** URL path that this page lives at, e.g. "/shop/suretite-320mm". Used for canonical + og:url. */
  path: string;
  /** Optional image. Accepts a relative path or absolute URL; defaults to the site logo. */
  image?: string | null;
  /** Optional keywords array. */
  keywords?: string[];
  /** Set true for pages that should not be indexed (e.g. auth/checkout). */
  noindex?: boolean;
}

/** Build a complete, canonical Metadata object for a public page. */
export function buildMetadata({
  title,
  description,
  path,
  image,
  keywords,
  noindex,
}: BuildMetadataArgs): Metadata {
  const canonical = absoluteUrl(path);
  const ogImage = image ? absoluteUrl(image) : DEFAULT_OG_IMAGE;
  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_ZA",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}
