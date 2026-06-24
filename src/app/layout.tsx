import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
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
  openGraph: {
    title: "Sealed & Secured",
    description:
      "Premium security seal solutions for logistics and industrial sectors.",
    siteName: "Sealed & Secured",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}