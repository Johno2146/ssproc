import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.tracking.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin User
  const adminPasswordHash = await bcrypt.hash("admin123", 12);
  await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@ssproc.co.za",
      passwordHash: adminPasswordHash,
      role: "admin",
    },
  });

  // Create Products
  const productsData = [
    {
      name: "Suretite 320mm",
      slug: "suretite-320mm",
      category: "Plastic Seals",
      price: 870.00,
      description: "High-quality pull-tight plastic security seal with a 320mm length. Ideal for securing bags, roll cages, and containers.",
      unit: "Per 1000",
      minOrder: 1,
      stock: 500,
    },
    {
      name: "Suretite 230mm",
      slug: "suretite-230mm",
      category: "Plastic Seals",
      price: 810.00,
      description: "Compact pull-tight plastic security seal with a 230mm length. Versatile application for logistics and retail.",
      unit: "Per 1000",
      minOrder: 1,
      stock: 500,
    },
    {
      name: "Suretite Barcoded",
      slug: "suretite-barcoded",
      category: "Plastic Seals",
      price: 1050.00,
      description: "Pull-tight plastic security seal featuring unique barcoding for enhanced tracking and asset management.",
      unit: "Per 1000",
      minOrder: 1,
      stock: 200,
    },
    {
      name: "Twinlock Standard",
      slug: "twinlock-standard",
      category: "Plastic Seals",
      price: 870.00,
      description: "High-security fixed-length plastic seal. Features a double-locking mechanism for superior tamper resistance.",
      unit: "Per 1000",
      minOrder: 1,
      stock: 300,
    },
    {
      name: "Twinlock Barcoded",
      slug: "twinlock-barcoded",
      category: "Plastic Seals",
      price: 1050.00,
      description: "Twinlock security seal with integrated barcoding. Combines physical security with digital tracking capabilities.",
      unit: "Per 1000",
      minOrder: 1,
      stock: 150,
    },
    {
      name: "Padlock Seal",
      slug: "padlock-seal",
      category: "Plastic Seals",
      price: 1420.00,
      description: "Compact padlock-style security seal. Manufactured from high-quality polypropylene with a stainless steel wire.",
      unit: "Per 1000",
      minOrder: 1,
      stock: 1000,
    },
    {
      name: "Nylock Seal",
      slug: "nylock-seal",
      category: "Plastic Seals",
      price: 705.00,
      description: "Durable Nylon 6 security seal with a 15kg pull strength. Excellent for long-term applications requiring extra durability.",
      unit: "Per 1000",
      minOrder: 1,
      stock: 800,
    },
    {
      name: "Suregas Seal",
      slug: "suregas-seal",
      category: "Specialized Seals",
      price: 800.00,
      description: "Specialized security seal designed for gas cylinders and valve security. Features a large flag for clear identification.",
      unit: "Per 1000",
      minOrder: 1,
      stock: 400,
    },
    {
      name: "Cable Lock 500mm",
      slug: "cable-lock-500mm",
      category: "Cable Seals",
      price: 8.50,
      description: "High-security cable lock with 500mm length. Mild steel construction for industrial logistics.",
      unit: "Each",
      minOrder: 50,
      stock: 2000,
    },
    {
      name: "Bolt Seal NSS",
      slug: "bolt-seal-nss",
      category: "Bolt Seals",
      price: 8.00,
      description: "High-security bolt seal with 'NSS' printing. Ideal for shipping containers and heavy-duty logistics.",
      unit: "Each",
      minOrder: 50,
      stock: 1500,
    }
  ];

  for (const product of productsData) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
