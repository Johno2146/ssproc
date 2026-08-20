import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";

import { CANONICAL_BASE, DEFAULT_OG_IMAGE } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_BASE),
  title: "Sealed & Secured — Premium Security Seal Solutions",
  description:
    "Premium security seal solutions for logistics and industrial sectors. Simplify procurement with integrated PayFast payments and real-time WhatsApp order tracking.",
  keywords: [
    "security seals",
    "tamper evident",
    "logistics",
    "shipping",
    "South Africa",
    "PayFast",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Sealed & Secured — Premium Security Seal Solutions",
    description:
      "Premium security seal, tamper-evident and cable tie solutions for logistics and industrial sectors across South Africa.",
    siteName: "Sealed & Secured",
    type: "website",
    locale: "en_ZA",
    url: CANONICAL_BASE,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Sealed & Secured" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sealed & Secured — Premium Security Seal Solutions",
    description:
      "Premium security seal, tamper-evident and cable tie solutions for logistics and industrial sectors across South Africa.",
    images: [DEFAULT_OG_IMAGE],
  },
  // Search Console / Bing verification hooks — the owner can paste a verification
  // code into the matching env var (set in Vercel env / Secrets) and it is served
  // as a meta tag with NO code change required.
  ...((process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}) as any),
  ...((process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
    ? { other: { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } }
    : {}) as any),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            <CookieConsent />
          </div>
        </Providers>
      </body>
    </html>
  );
}