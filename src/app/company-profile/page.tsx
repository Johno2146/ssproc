import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { absoluteUrl, buildMetadata, CANONICAL_BASE } from "@/lib/seo";
import {
  LEGAL_NAME,
  REGISTRATION_NUMBER,
  SALES_EMAIL,
  STREET_ADDRESS,
  POSTAL_ADDRESS,
  OPENING_HOURS,
} from "@/lib/llms";

/**
 * /company-profile — a factual, citable one-pager for directory listings,
 * AI assistants and anyone verifying who they are buying from.
 *
 * Every statement on this page is an owner-verified fact (legal name,
 * registration number, address, phone, email, hours, catalogue, delivery
 * model, live payment method). Nothing speculative is published here: no
 * B-BBEE level, certifications, staff numbers or claims we cannot evidence.
 */

const PATH = "/company-profile";
const PHONE = "+27 10 555 0114";
const FULL_ADDRESS = `${STREET_ADDRESS}, ${POSTAL_ADDRESS}`;

export const metadata: Metadata = buildMetadata({
  title: "Company Profile | Sealed and Secured (Pty) Ltd",
  description:
    "Company profile for Sealed and Secured (Pty) Ltd, registration 2024/182314/07: a Springs, Gauteng supplier of security seals, tamper-evident seals, security bags and cable ties to logistics and industrial customers in South Africa.",
  path: PATH,
  keywords: [
    "Sealed and Secured company profile",
    "security seal supplier South Africa",
    "security seals Springs Gauteng",
    "tamper evident seals supplier",
    "cable ties supplier South Africa",
  ],
});

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid sm:grid-cols-3 gap-1 sm:gap-6 py-3 border-b border-gray-100 last:border-0">
      <dt className="text-sm font-semibold text-brand-950">{label}</dt>
      <dd className="sm:col-span-2 text-gray-700">{children}</dd>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mb-6">
      <h2 className="text-xl font-bold text-brand-950 mb-4">{title}</h2>
      {children}
    </section>
  );
}

export default function CompanyProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Sealed & Secured",
          legalName: LEGAL_NAME,
          identifier: REGISTRATION_NUMBER,
          url: absoluteUrl(PATH),
          telephone: PHONE,
          email: SALES_EMAIL,
          address: {
            "@type": "PostalAddress",
            streetAddress: "Eastwood Business Park, 23 Wright Street, Nuffield",
            addressLocality: "Springs",
            addressRegion: "Gauteng",
            postalCode: "1559",
            addressCountry: "ZA",
          },
          openingHours: ["Mo-Th 08:00-16:30", "Fr 08:00-14:30"],
          areaServed: { "@type": "Country", name: "South Africa" },
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <nav className="flex mb-8 text-sm text-gray-500">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-brand-950 font-medium">Company Profile</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-brand-950 mb-3">
            Company Profile
          </h1>
          <p className="text-gray-600 leading-relaxed">
            A factual summary of {LEGAL_NAME} — who we are, what we supply, how we
            deliver and how to pay — for customers, suppliers, directories and
            procurement teams. Last reviewed November 2026.
          </p>
        </header>

        <Section title="Registered business details">
          <dl>
            <Row label="Legal name">{LEGAL_NAME}</Row>
            <Row label="Registration number">{REGISTRATION_NUMBER}</Row>
            <Row label="Trading name">Sealed &amp; Secured</Row>
            <Row label="Business address">{FULL_ADDRESS}</Row>
            <Row label="Telephone">
              <a href="tel:+27105550114" className="text-brand-600 hover:underline">{PHONE}</a>
            </Row>
            <Row label="Email">
              <a href={`mailto:${SALES_EMAIL}`} className="text-brand-600 hover:underline">{SALES_EMAIL}</a>
            </Row>
            <Row label="Website">
              <a href={CANONICAL_BASE} className="text-brand-600 hover:underline">{CANONICAL_BASE}</a>
            </Row>
            <Row label="Trading hours">
              {OPENING_HOURS.join("; ")} (South African Standard Time)
            </Row>
            <Row label="Country of operation">South Africa</Row>
          </dl>
        </Section>

        <Section title="What we supply">
          <p className="text-gray-700 leading-relaxed mb-4">
            Security seals, tamper-evident products and cable ties, sold online in
            fixed pack sizes to logistics companies, shipping firms, retail
            distributors and other security-sensitive businesses in South Africa.
            The catalogue covers:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Plastic seals — Suretite, Twinlock, Nylock and padlock seals</li>
            <li>Bolt seals and cable seals / cable locks for containers and trailers</li>
            <li>Metal strap seals (ball and flat)</li>
            <li>Tamper-evident security bags — cash bags, till bags and Envopoly bags</li>
            <li>Plastic cable ties from 100mm to 540mm, including handcuff ties</li>
            <li>Stainless steel cable ties from 150mm to 800mm, plus an installation tool</li>
            <li>Plastic tags — Motag and compression tags in a range of colours</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            Qualifying products can be laser printed with unique sequential
            numbers, barcodes, QR codes and a company logo.{" "}
            <Link href="/services" className="text-brand-600 hover:underline">
              See printing and branding options
            </Link>
            .
          </p>
        </Section>

        <Section title="How to buy">
          <p className="text-gray-700 leading-relaxed">
            Orders are placed online through the shop at{" "}
            <Link href="/shop" className="text-brand-600 hover:underline">
              {CANONICAL_BASE}/shop
            </Link>
            , where every product is listed with its pack size and price. For
            quotations, custom printing or orders larger than the online limits,
            contact the sales team on {PHONE} or at {SALES_EMAIL}.
          </p>
        </Section>

        <Section title="Pricing">
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>All prices are quoted in South African rand (ZAR).</li>
            <li>
              Prices displayed are final prices. No VAT is added at checkout — the
              price shown plus the delivery charge is the amount charged.
            </li>
            <li>
              Products are sold in fixed pack sizes; bulk quantities are priced per
              pack size, with larger packs priced lower per unit.
            </li>
          </ul>
        </Section>

        <Section title="Delivery model">
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Flat-rate delivery of R150 for orders of 1–5 boxes.</li>
            <li>
              R300 flat rate when an order contains 1,000 or more seal pieces
              (plastic, bolt, cable or metal seals) and is still within 5 boxes.
            </li>
            <li>Orders larger than 5 boxes are not sold online and are quoted individually.</li>
            <li>
              Collection from our Springs, Gauteng address is free where the product
              allows it.
            </li>
            <li>Cable ties and plastic tags are delivery only — they cannot be collected.</li>
            <li>Delivery is nationwide within South Africa.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            <Link href="/shipping" className="text-brand-600 hover:underline">
              Full shipping and delivery policy
            </Link>
          </p>
        </Section>

        <Section title="Payment methods">
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>
              Online payment through PayFast at checkout — the only payment method
              currently live on the website.
            </li>
            <li>
              Payment details are entered on PayFast&apos;s secure checkout, not on
              this website.
            </li>
            <li>An order is confirmed once PayFast reports the payment as successful.</li>
          </ul>
        </Section>

        <Section title="Documentation requests">
          <p className="text-gray-700 leading-relaxed">
            For company registration documents, tax clearance, banking details or
            any other supplier-onboarding paperwork, email{" "}
            <a href={`mailto:${SALES_EMAIL}`} className="text-brand-600 hover:underline">
              {SALES_EMAIL}
            </a>{" "}
            or call {PHONE} during trading hours. Documents are issued directly by
            the business; nothing on this website should be read as a certification
            or accreditation claim.
          </p>
        </Section>

        <p className="text-sm text-gray-500">
          Details on this page are reviewed periodically and updated when the
          business changes. See also the{" "}
          <Link href="/about" className="text-brand-600 hover:underline">About</Link>{" "}
          page and the{" "}
          <Link href="/contact" className="text-brand-600 hover:underline">Contact</Link>{" "}
          page.
        </p>
      </div>
    </div>
  );
}
