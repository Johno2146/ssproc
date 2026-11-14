import { CANONICAL_BASE, CONTACT_PHONE } from "@/lib/seo";
import { quantityTiers, productSpecs, type QuantityTier } from "@/lib/productData";
import { withVat } from "@/lib/vat";
import type { CatalogProduct } from "@/lib/catalog";

/**
 * Builders for the AI-discoverability files: /llms.txt and /llms-full.txt
 * (llmstxt.org convention). Product names and categories come from the same
 * Turso rows the shop lists, and pack sizes/prices come from `quantityTiers` —
 * the same module the shop and product pages render from — so the files cannot
 * drift from what a customer sees.
 */

export const LEGAL_NAME = "Sealed and Secured (Pty) Ltd";
export const REGISTRATION_NUMBER = "2024/182314/07";
export const SALES_EMAIL = "sales@ssproc.co.za";
export const STREET_ADDRESS = "Eastwood Business Park, 23 Wright Street, Nuffield, Springs";
export const POSTAL_ADDRESS = "Gauteng, 1559, South Africa";
export const OPENING_HOURS = ["Monday–Thursday 08:00–16:30", "Friday 08:00–14:30"];

const u = (path: string) => `${CANONICAL_BASE}${path}`;

const PAGES: { path: string; title: string; note: string }[] = [
  { path: "/shop", title: "Shop — all products", note: "Complete catalogue with pack sizes and prices." },
  { path: "/shop?category=plastic", title: "Plastic Seals", note: "Suretite, Twinlock, Nylock and padlock seals." },
  { path: "/shop?category=barrier", title: "Bolt & Cable Seals", note: "Bolt seals, cable seals and cable locks for containers and trailers." },
  { path: "/shop?category=metal", title: "Metal Seals", note: "Metal strap seals (ball and flat)." },
  { path: "/shop?category=security-bags", title: "Security Bags", note: "Tamper-evident cash bags, till bags and Envopoly bags." },
  { path: "/shop?category=plastic-cable-ties", title: "Plastic Cable Ties", note: "Nylon cable ties from 100mm to 540mm, including handcuff ties." },
  { path: "/shop?category=steel-cable-ties", title: "Stainless Steel Cable Ties", note: "SS304 cable ties from 150mm to 800mm and an installation tool." },
  { path: "/shop?category=plastic-tags", title: "Plastic tags", note: "Motag and compression tags in a range of colours (delivery only)." },
  { path: "/about", title: "About", note: "Company background and what we supply." },
  { path: "/services", title: "Services", note: "Laser printing, barcoding and branding options." },
  { path: "/shipping", title: "Shipping & delivery", note: "Flat-rate delivery charges and collection rules." },
  { path: "/contact", title: "Contact", note: "Phone, email, address and contact form." },
  { path: "/terms", title: "Terms & conditions", note: "Sales terms." },
  { path: "/refund", title: "Refund policy", note: "Returns and refunds." },
  { path: "/privacy", title: "Privacy policy", note: "How customer data is handled." },
  { path: "/cookies", title: "Cookie policy", note: "Cookie usage." },
];

const SUMMARY =
  "Sealed and Secured supplies security seals, tamper-evident seals, security bags and cable ties to logistics, " +
  "shipping, retail and industrial customers in South Africa. Products are sold online with flat-rate delivery " +
  "nationwide, or collection from the Springs, Gauteng warehouse.";

const FALLBACK_FACTS = [
  `Legal name: ${LEGAL_NAME} (registration number ${REGISTRATION_NUMBER})`,
  `Address: ${STREET_ADDRESS}, ${POSTAL_ADDRESS}`,
  `Phone: ${CONTACT_PHONE}`,
  `Email: ${SALES_EMAIL}`,
  `Trading hours: ${OPENING_HOURS.join("; ")}`,
  "Area served: South Africa (delivery nationwide; collection in Springs, Gauteng)",
  "Currency: South African rand (ZAR). Prices shown are final — no VAT is added at checkout.",
  "Payment: online payment through PayFast at checkout.",
  "Delivery: R150 flat rate for 1–5 boxes; R300 when an order contains 1,000 or more seal pieces " +
    "(plastic, bolt, cable or metal seals). Orders over 5 boxes require a custom quote. " +
    "Collection from Springs is free where the product allows it; cable ties and plastic tags are delivery only.",
];

function money(value: number): string {
  return `R${withVat(value).toFixed(2)}`;
}

function tierLine(tiers: QuantityTier[]): string {
  return tiers
    .map((t) => {
      const size = t.unit && t.unit !== t.label ? `${t.label} (${t.unit})` : t.label || t.unit;
      return `${size} ${money(t.price)}`;
    })
    .join("; ");
}

function priceLine(product: CatalogProduct): string {
  const tiers = quantityTiers[product.slug];
  if (tiers && tiers.length > 0) return tierLine(tiers);
  return `${money(product.price)} ${product.unit}`;
}

function groupByCategory(products: CatalogProduct[], order: readonly string[]) {
  const groups = new Map<string, CatalogProduct[]>();
  for (const p of products) {
    const key = p.category || "Other";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }
  return [...groups.entries()].sort((a, b) => {
    const ai = order.indexOf(a[0]);
    const bi = order.indexOf(b[0]);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });
}

export function buildLlmsTxt(products: CatalogProduct[], order: readonly string[]): string {
  const lines: string[] = [];
  lines.push("# Sealed and Secured");
  lines.push("");
  lines.push(`> ${SUMMARY}`);
  lines.push("");
  lines.push(SUMMARY);
  lines.push("");
  lines.push(
    "The catalogue covers plastic seals (Suretite, Twinlock, Nylock, padlock seals), bolt seals and cable seals " +
      "for containers and trailers, metal strap seals, tamper-evident security bags, plastic cable ties, " +
      "stainless steel cable ties and plastic tags. Bulk quantities are priced per pack size, and qualifying " +
      "products can be laser printed with serial numbers, barcodes or a company logo."
  );
  lines.push("");
  lines.push("## Company details");
  lines.push("");
  for (const fact of FALLBACK_FACTS) lines.push(`- ${fact}`);
  lines.push("");
  lines.push("## Pages");
  lines.push("");
  for (const page of PAGES) lines.push(`- [${page.title}](${u(page.path)}): ${page.note}`);
  lines.push("");
  lines.push("## Product index");
  lines.push("");
  if (products.length === 0) {
    lines.push(
      "The live product list could not be read at the time this file was generated. " +
        `See ${u("/shop")} for the current catalogue, pack sizes and prices.`
    );
  } else {
    for (const [category, items] of groupByCategory(products, order)) {
      lines.push(`### ${category}`);
      lines.push("");
      for (const p of items) {
        lines.push(`- [${p.name}](${u(`/shop/${p.slug}`)}): ${priceLine(p)}`);
      }
      lines.push("");
    }
  }
  lines.push("## Notes");
  lines.push("");
  lines.push("- All prices are in South African rand (ZAR) and are the final prices charged at checkout.");
  lines.push("- Pack prices and pack sizes above are read from the same data the shop renders.");
  lines.push("- For quotations, custom printing or orders above 5 boxes, contact the sales team.");
  lines.push("");
  return lines.join("\n");
}

export function buildLlmsFullTxt(products: CatalogProduct[], order: readonly string[]): string {
  const lines: string[] = [];
  lines.push("# Sealed and Secured — full reference");
  lines.push("");
  lines.push(`> ${SUMMARY}`);
  lines.push("");
  lines.push("## Company");
  lines.push("");
  lines.push(`${LEGAL_NAME}, registration number ${REGISTRATION_NUMBER}.`);
  lines.push("");
  lines.push(`Address: ${STREET_ADDRESS}, ${POSTAL_ADDRESS}.`);
  lines.push("");
  lines.push(`Phone: ${CONTACT_PHONE}. Email: ${SALES_EMAIL}.`);
  lines.push("");
  lines.push(`Trading hours: ${OPENING_HOURS.join("; ")}.`);
  lines.push("");
  lines.push("Area served: South Africa, with delivery nationwide and collection from Springs, Gauteng.");
  lines.push("");
  lines.push(
    "Customers are logistics companies, shipping and freight firms, retail distributors and other " +
      "security-sensitive businesses that need to seal containers, trailers, bags, drums, meters and stock."
  );
  lines.push("");
  lines.push("## Ordering and payment");
  lines.push("");
  lines.push("- Orders are placed on the website and paid online through PayFast at checkout.");
  lines.push("- Prices are in South African rand (ZAR) and are final as displayed; no VAT is added at checkout.");
  lines.push("- Each product is sold in fixed pack sizes; the pack size and price are listed with the product.");
  lines.push("- Order confirmation and tracking details are emailed to the address given at checkout.");
  lines.push("");
  lines.push("## Delivery and collection");
  lines.push("");
  lines.push("- Flat-rate delivery of R150 for orders of 1–5 boxes.");
  lines.push("- R300 delivery when an order contains 1,000 or more seal pieces (plastic, bolt, cable or metal seals).");
  lines.push("- Orders larger than 5 boxes cannot be shipped online and need a custom quote from the sales team.");
  lines.push("- Collection from the Springs (Gauteng) warehouse is free for products that allow collection.");
  lines.push("- Plastic cable ties and plastic tags are delivery only — no collection.");
  lines.push("");
  lines.push("## Pages");
  lines.push("");
  for (const page of PAGES) lines.push(`- [${page.title}](${u(page.path)}): ${page.note}`);
  lines.push("");
  lines.push("## Products");
  lines.push("");
  if (products.length === 0) {
    lines.push(
      "The live product list could not be read at the time this file was generated. " +
        `See ${u("/shop")} for the current catalogue, pack sizes and prices.`
    );
    lines.push("");
    return lines.join("\n");
  }
  for (const [category, items] of groupByCategory(products, order)) {
    lines.push(`### ${category}`);
    lines.push("");
    for (const p of items) {
      lines.push(`#### ${p.name}`);
      lines.push("");
      lines.push(`URL: ${u(`/shop/${p.slug}`)}`);
      lines.push("");
      if (p.description) {
        lines.push(p.description.trim());
        lines.push("");
      }
      const specs = productSpecs[p.slug];
      if (specs) {
        if (specs.material) lines.push(`- Material: ${specs.material}`);
        if (specs.dimensions) lines.push(`- Dimensions: ${specs.dimensions}`);
        if (specs.pullStrength) lines.push(`- Pull strength: ${specs.pullStrength}`);
        if (specs.securityLevel) lines.push(`- Security level: ${specs.securityLevel}`);
        if (specs.applications?.length) lines.push(`- Applications: ${specs.applications.join(", ")}`);
        if (specs.printing?.length) lines.push(`- Printing options: ${specs.printing.join(", ")}`);
        lines.push("");
      }
      const tiers = quantityTiers[p.slug];
      if (tiers && tiers.length > 0) {
        lines.push("Pack sizes and prices (ZAR, final price):");
        lines.push("");
        for (const t of tiers) {
          const size = t.unit && t.unit !== t.label ? `${t.label} (${t.unit})` : t.label || t.unit;
          lines.push(`- ${size}: ${money(t.price)}`);
        }
      } else {
        lines.push(`Price: ${money(p.price)} ${p.unit}`);
      }
      lines.push("");
    }
  }
  return lines.join("\n");
}
