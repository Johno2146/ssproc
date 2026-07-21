// Seed script: Populate database with product catalog
// Run: npx tsx prisma/seed.ts

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const products = [
  {
    id: "clx1",
    name: "Suretite 320mm",
    slug: "suretite-320mm",
    category: "Plastic Seals",
    price: 870.00,
    unit: "box",
    minOrder: 1,
    stock: 500,
    description: "High-quality pull-tight plastic security seal with a 320mm length. Ideal for securing bags, roll cages, and containers.",
    imageUrl: "/assets/plastic-seals.png",
  },
  {
    id: "clx2",
    name: "Suretite 230mm",
    slug: "suretite-230mm",
    category: "Plastic Seals",
    price: 810.00,
    unit: "box",
    minOrder: 1,
    stock: 500,
    description: "Compact pull-tight plastic security seal with a 230mm length. Versatile application for logistics and retail packaging security.",
    imageUrl: "/assets/plastic-seals.png",
  },
  {
    id: "clx3",
    name: "Suretite Barcoded",
    slug: "suretite-barcoded",
    category: "Plastic Seals",
    price: 1050.00,
    unit: "box",
    minOrder: 1,
    stock: 500,
    description: "Pull-tight plastic security seal featuring unique laser-etched barcoding for enhanced tracking and asset management.",
    imageUrl: "/assets/plastic-seals.png",
  },
  {
    id: "clx4",
    name: "Twinlock Standard",
    slug: "twinlock-standard",
    category: "Plastic Seals",
    price: 870.00,
    unit: "box",
    minOrder: 1,
    stock: 500,
    description: "High-security fixed-length plastic seal with double-locking mechanism for superior tamper resistance.",
    imageUrl: "/assets/plastic-seals.png",
  },
  {
    id: "clx5",
    name: "Twinlock Barcoded",
    slug: "twinlock-barcoded",
    category: "Plastic Seals",
    price: 1050.00,
    unit: "box",
    minOrder: 1,
    stock: 500,
    description: "Twinlock security seal with integrated barcoding. Combines physical security with digital tracking.",
    imageUrl: "/assets/plastic-seals.png",
  },
  {
    id: "clx6",
    name: "Padlock Seal",
    slug: "padlock-seal",
    category: "Plastic Seals",
    price: 1420.00,
    unit: "box",
    minOrder: 1,
    stock: 500,
    description: "Compact padlock-style security seal with stainless steel wire and polypropylene body.",
    imageUrl: "/assets/plastic-seals.png",
  },
  {
    id: "clx7",
    name: "Nylock Seal",
    slug: "nylock-seal",
    category: "Plastic Seals",
    price: 705.00,
    unit: "box",
    minOrder: 1,
    stock: 500,
    description: "Durable Nylon 6 security seal with 15kg pull strength for long-term applications.",
    imageUrl: "/assets/plastic-seals.png",
  },
  {
    id: "clx8",
    name: "Suregas Seal",
    slug: "suregas-seal",
    category: "Specialized Seals",
    price: 800.00,
    unit: "box",
    minOrder: 1,
    stock: 500,
    description: "Specialized security seal for gas cylinders and valve security with large identification flag.",
    imageUrl: "/assets/plastic-seals.png",
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@ssproc.co.za" },
    update: {},
    create: {
      email: "admin@ssproc.co.za",
      name: "Admin",
      passwordHash: adminPassword,
      role: "admin",
    },
  });
  console.log(`✓ Admin user created: ${admin.email}`);

  // Create products
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }
  console.log(`✓ ${products.length} products created`);

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
