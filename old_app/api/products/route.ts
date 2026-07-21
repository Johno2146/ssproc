import { NextResponse } from "next/server";

// Product data sourced from Price List 2026, Suretite, Twinlock, Nylock, Padlock, and Suregas PDFs
const products = [
  {
    id: "suretite-320mm",
    name: "Suretite 320mm",
    slug: "suretite-320mm",
    category: "Plastic Seals",
    price: 870.00,
    unit: "box",
    minOrder: 1,
    description: "High-quality pull-tight plastic security seal with a 320mm length. Ideal for securing bags, roll cages, and containers. Manufactured from durable polypropylene with a reliable pull-tight locking mechanism.",
    specs: ["320mm Total Length", "Pull-tight locking mechanism", "Polypropylene construction", "Tamper-evident design"],
    image: "/assets/plastic-seals.png",
    stock: 500,
  },
  {
    id: "suretite-230mm",
    name: "Suretite 230mm",
    slug: "suretite-230mm",
    category: "Plastic Seals",
    price: 810.00,
    unit: "box",
    minOrder: 1,
    description: "Compact pull-tight plastic security seal with a 230mm length. Versatile application for logistics and retail packaging security.",
    specs: ["230mm Total Length", "Pull-tight locking mechanism", "Polypropylene construction", "Easy application"],
    image: "/assets/plastic-seals.png",
    stock: 500,
  },
  {
    id: "suretite-barcoded",
    name: "Suretite Barcoded",
    slug: "suretite-barcoded",
    category: "Plastic Seals",
    price: 1050.00,
    unit: "box",
    minOrder: 1,
    description: "Pull-tight plastic security seal featuring unique laser-etched barcoding for enhanced tracking and asset management.",
    specs: ["Laser-etched Barcode", "Sequential Numbering", "High visibility marking", "Tamper-evident"],
    image: "/assets/plastic-seals.png",
    stock: 500,
  },
  {
    id: "twinlock-standard",
    name: "Twinlock Standard",
    slug: "twinlock-standard",
    category: "Plastic Seals",
    price: 870.00,
    unit: "box",
    minOrder: 1,
    description: "High-security fixed-length plastic seal. Features a double-locking mechanism for superior tamper resistance.",
    specs: ["Double-locking mechanism", "Fixed length design", "High tensile strength", "Weather resistant"],
    image: "/assets/plastic-seals.png",
    stock: 500,
  },
  {
    id: "twinlock-barcoded",
    name: "Twinlock Barcoded",
    slug: "twinlock-barcoded",
    category: "Plastic Seals",
    price: 1050.00,
    unit: "box",
    minOrder: 1,
    description: "Twinlock security seal with integrated barcoding. Combines physical security with digital tracking capabilities.",
    specs: ["Integrated Barcode", "Fixed length", "Double locking", "Enhanced tracking"],
    image: "/assets/plastic-seals.png",
    stock: 500,
  },
  {
    id: "padlock-seal",
    name: "Padlock Seal",
    slug: "padlock-seal",
    category: "Plastic Seals",
    price: 1420.00,
    unit: "box",
    minOrder: 1,
    description: "Compact padlock-style security seal. Manufactured from high-quality polypropylene with a stainless steel wire for maximum tamper evidence.",
    specs: ["Stainless steel wire", "Polypropylene body", "37mm x 21mm Dimensions", "Wide range of applications"],
    image: "/assets/plastic-seals.png",
    stock: 500,
  },
  {
    id: "nylock-seal",
    name: "Nylock Seal",
    slug: "nylock-seal",
    category: "Plastic Seals",
    price: 705.00,
    unit: "box",
    minOrder: 1,
    description: "Durable Nylon 6 security seal with a 15kg pull strength. Excellent for long-term applications requiring extra durability.",
    specs: ["Nylon 6 Material", "15kg Pull Strength", "High durability", "Tamper-evident"],
    image: "/assets/plastic-seals.png",
    stock: 500,
  },
  {
    id: "suregas-seal",
    name: "Suregas Seal",
    slug: "suregas-seal",
    category: "Specialized Seals",
    price: 800.00,
    unit: "box",
    minOrder: 1,
    description: "Specialized security seal designed for gas cylinder and valve security. Features a large flag area for clear identification and branding.",
    specs: ["270mm x 6mm dimensions", "28mm x 30mm flag", "Polypropylene construction", "Ideal for gas industries"],
    image: "/assets/plastic-seals.png",
    stock: 500,
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const id = searchParams.get("id");

  let filtered = products;

  if (id) {
    filtered = filtered.filter((p) => p.id === id || p.slug === id);
    if (filtered.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(filtered[0]);
  }

  if (category && category !== "all") {
    filtered = filtered.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    products: filtered,
    total: filtered.length,
  });
}