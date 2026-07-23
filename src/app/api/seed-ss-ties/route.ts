import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL || "",
  authToken: process.env.TURSO_AUTH_TOKEN || "",
});

export async function GET() {
  try {
    // Delete existing SS products
    await turso.execute({ sql: "DELETE FROM Product WHERE category IN ('Stainless Steel Cable Ties', 'Installation Tools')" });
    
    const products = [
      // 4.6mm series - Pack of 100
      { name: "SS Cable Tie 4.6×150mm", slug: "ss-4-6-150mm", category: "Stainless Steel Cable Ties", price: 218.14, unit: "Pack of 100", minOrder: 1, stock: 500, imageUrl: "/assets/SS Cable tie.jpg", description: "Stainless Steel 304 cable tie, 4.6 × 150 mm. Corrosion resistant, high tensile. Pack of 100." },
      { name: "SS Cable Tie 4.6×200mm", slug: "ss-4-6-200mm", category: "Stainless Steel Cable Ties", price: 249.65, unit: "Pack of 100", minOrder: 1, stock: 500, imageUrl: "/assets/SS Cable tie.jpg", description: "Stainless Steel 304 cable tie, 4.6 × 200 mm. Corrosion resistant, high tensile. Pack of 100." },
      { name: "SS Cable Tie 4.6×250mm", slug: "ss-4-6-250mm", category: "Stainless Steel Cable Ties", price: 278.74, unit: "Pack of 100", minOrder: 1, stock: 500, imageUrl: "/assets/SS Cable tie.jpg", description: "Stainless Steel 304 cable tie, 4.6 × 250 mm. Corrosion resistant, high tensile. Pack of 100." },
      { name: "SS Cable Tie 4.6×300mm", slug: "ss-4-6-300mm", category: "Stainless Steel Cable Ties", price: 298.12, unit: "Pack of 100", minOrder: 1, stock: 500, imageUrl: "/assets/SS Cable tie.jpg", description: "Stainless Steel 304 cable tie, 4.6 × 300 mm. Corrosion resistant, high tensile. Pack of 100." },
      { name: "SS Cable Tie 4.6×350mm", slug: "ss-4-6-350mm", category: "Stainless Steel Cable Ties", price: 344.18, unit: "Pack of 100", minOrder: 1, stock: 500, imageUrl: "/assets/SS Cable tie.jpg", description: "Stainless Steel 304 cable tie, 4.6 × 350 mm. Corrosion resistant, high tensile. Pack of 100." },
      { name: "SS Cable Tie 4.6×400mm", slug: "ss-4-6-400mm", category: "Stainless Steel Cable Ties", price: 380.54, unit: "Pack of 100", minOrder: 1, stock: 500, imageUrl: "/assets/SS Cable tie.jpg", description: "Stainless Steel 304 cable tie, 4.6 × 400 mm. Corrosion resistant, high tensile. Pack of 100." },
      { name: "SS Cable Tie 4.6×450mm", slug: "ss-4-6-450mm", category: "Stainless Steel Cable Ties", price: 421.74, unit: "Pack of 100", minOrder: 1, stock: 500, imageUrl: "/assets/SS Cable tie.jpg", description: "Stainless Steel 304 cable tie, 4.6 × 450 mm. Corrosion resistant, high tensile. Pack of 100." },
      { name: "SS Cable Tie 4.6×500mm", slug: "ss-4-6-500mm", category: "Stainless Steel Cable Ties", price: 458.10, unit: "Pack of 100", minOrder: 1, stock: 500, imageUrl: "/assets/SS Cable tie.jpg", description: "Stainless Steel 304 cable tie, 4.6 × 500 mm. Corrosion resistant, high tensile. Pack of 100." },
      { name: "SS Cable Tie 4.6×550mm", slug: "ss-4-6-550mm", category: "Stainless Steel Cable Ties", price: 492.03, unit: "Pack of 100", minOrder: 1, stock: 500, imageUrl: "/assets/SS Cable tie.jpg", description: "Stainless Steel 304 cable tie, 4.6 × 550 mm. Corrosion resistant, high tensile. Pack of 100." },
      { name: "SS Cable Tie 4.6×600mm", slug: "ss-4-6-600mm", category: "Stainless Steel Cable Ties", price: 528.38, unit: "Pack of 100", minOrder: 1, stock: 500, imageUrl: "/assets/SS Cable tie.jpg", description: "Stainless Steel 304 cable tie, 4.6 × 600 mm. Corrosion resistant, high tensile. Pack of 100." },
      // 7.9mm series - Pack of 100
      { name: "SS Cable Tie 7.9×200mm", slug: "ss-7-9-200mm", category: "Stainless Steel Cable Ties", price: 325.59, unit: "Pack of 100", minOrder: 1, stock: 500, imageUrl: "/assets/SS Cable tie.jpg", description: "Stainless Steel 304 cable tie, 7.9 × 200 mm. Corrosion resistant, high tensile. Pack of 100." },
      { name: "SS Cable Tie 7.9×250mm", slug: "ss-7-9-250mm", category: "Stainless Steel Cable Ties", price: 357.10, unit: "Pack of 100", minOrder: 1, stock: 500, imageUrl: "/assets/SS Cable tie.jpg", description: "Stainless Steel 304 cable tie, 7.9 × 250 mm. Corrosion resistant, high tensile. Pack of 100." },
      { name: "SS Cable Tie 7.9×300mm", slug: "ss-7-9-300mm", category: "Stainless Steel Cable Ties", price: 411.64, unit: "Pack of 100", minOrder: 1, stock: 500, imageUrl: "/assets/SS Cable tie.jpg", description: "Stainless Steel 304 cable tie, 7.9 × 300 mm. Corrosion resistant, high tensile. Pack of 100." },
      { name: "SS Cable Tie 7.9×350mm", slug: "ss-7-9-350mm", category: "Stainless Steel Cable Ties", price: 441.13, unit: "Pack of 100", minOrder: 1, stock: 500, imageUrl: "/assets/SS Cable tie.jpg", description: "Stainless Steel 304 cable tie, 7.9 × 350 mm. Corrosion resistant, high tensile. Pack of 100." },
      { name: "SS Cable Tie 7.9×400mm", slug: "ss-7-9-400mm", category: "Stainless Steel Cable Ties", price: 495.74, unit: "Pack of 100", minOrder: 1, stock: 500, imageUrl: "/assets/SS Cable tie.jpg", description: "Stainless Steel 304 cable tie, 7.9 × 400 mm. Corrosion resistant, high tensile. Pack of 100." },
      { name: "SS Cable Tie 7.9×450mm", slug: "ss-7-9-450mm", category: "Stainless Steel Cable Ties", price: 532.43, unit: "Pack of 100", minOrder: 1, stock: 500, imageUrl: "/assets/SS Cable tie.jpg", description: "Stainless Steel 304 cable tie, 7.9 × 450 mm. Corrosion resistant, high tensile. Pack of 100." },
      { name: "SS Cable Tie 7.9×500mm", slug: "ss-7-9-500mm", category: "Stainless Steel Cable Ties", price: 532.43, unit: "Pack of 100", minOrder: 1, stock: 500, imageUrl: "/assets/SS Cable tie.jpg", description: "Stainless Steel 304 cable tie, 7.9 × 500 mm. Corrosion resistant, high tensile. Pack of 100." },
      { name: "SS Cable Tie 7.9×550mm", slug: "ss-7-9-550mm", category: "Stainless Steel Cable Ties", price: 567.16, unit: "Pack of 100", minOrder: 1, stock: 500, imageUrl: "/assets/SS Cable tie.jpg", description: "Stainless Steel 304 cable tie, 7.9 × 550 mm. Corrosion resistant, high tensile. Pack of 100." },
      { name: "SS Cable Tie 7.9×600mm", slug: "ss-7-9-600mm", category: "Stainless Steel Cable Ties", price: 661.12, unit: "Pack of 100", minOrder: 1, stock: 500, imageUrl: "/assets/SS Cable tie.jpg", description: "Stainless Steel 304 cable tie, 7.9 × 600 mm. Corrosion resistant, high tensile. Pack of 100." },
      { name: "SS Cable Tie 7.9×650mm", slug: "ss-7-9-650mm", category: "Stainless Steel Cable Ties", price: 707.91, unit: "Pack of 100", minOrder: 1, stock: 500, imageUrl: "/assets/SS Cable tie.jpg", description: "Stainless Steel 304 cable tie, 7.9 × 650 mm. Corrosion resistant, high tensile. Pack of 100." },
      { name: "SS Cable Tie 7.9×700mm", slug: "ss-7-9-700mm", category: "Stainless Steel Cable Ties", price: 736.74, unit: "Pack of 100", minOrder: 1, stock: 500, imageUrl: "/assets/SS Cable tie.jpg", description: "Stainless Steel 304 cable tie, 7.9 × 700 mm. Corrosion resistant, high tensile. Pack of 100." },
      { name: "SS Cable Tie 7.9×750mm", slug: "ss-7-9-750mm", category: "Stainless Steel Cable Ties", price: 796.13, unit: "Pack of 100", minOrder: 1, stock: 500, imageUrl: "/assets/SS Cable tie.jpg", description: "Stainless Steel 304 cable tie, 7.9 × 750 mm. Corrosion resistant, high tensile. Pack of 100." },
      { name: "SS Cable Tie 7.9×800mm", slug: "ss-7-9-800mm", category: "Stainless Steel Cable Ties", price: 833.94, unit: "Pack of 100", minOrder: 1, stock: 500, imageUrl: "/assets/SS Cable tie.jpg", description: "Stainless Steel 304 cable tie, 7.9 × 800 mm. Corrosion resistant, high tensile. Pack of 100." },
      // Installation Tool
      { name: "SS Cable Tie Installation Tool", slug: "ss-installation-tool", category: "Stainless Steel Cable Ties", price: 1980.34, unit: "Pack of 1", minOrder: 1, stock: 50, imageUrl: "/assets/CT Installation tool.jpg", description: "Professional installation tool for stainless steel cable ties. Ergonomic design, durable construction." },
    ];

    let created = 0;
    let skipped = 0;

    for (const p of products) {
      const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
      if (existing) {
        skipped++;
        continue;
      }
      await prisma.product.create({ data: p });
      created++;
    }

    return NextResponse.json({ success: true, created, skipped, total: products.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
// rebuild trigger
