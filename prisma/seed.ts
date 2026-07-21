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
      emailVerified: new Date(),
      passwordHash: adminPasswordHash,
      role: "admin",
    },
  });

  // Create Products
  const productsData = [
    {
      name: "Suretite 230mm",
      slug: "suretite-230mm",
      category: "Plastic Seals",
      price: 810.00,
      imageUrl: "/assets/suretite.jpg",
      description: "Compact pull-tight plastic security seal with a 230mm length. Versatile application for logistics and retail.",
      unit: "Per 1000",
      minOrder: 1,
      stock: 500,
    },
    {
      name: "Suretite 320mm",
      slug: "suretite-320mm",
      category: "Plastic Seals",
      price: 870.00,
      imageUrl: "/assets/suretite.jpg",
      description: "High-quality pull-tight plastic security seal with a 320mm length. Ideal for securing bags, roll cages, and containers.",
      unit: "Per 1000",
      minOrder: 1,
      stock: 500,
    },
    {
      name: "Suretite Barcoded",
      slug: "suretite-barcoded",
      category: "Plastic Seals",
      price: 1050.00,
      imageUrl: "/assets/suretite.jpg",
      description: "Pull-tight plastic security seal featuring unique barcoding for enhanced tracking and asset management.",
      unit: "Per 1000",
      minOrder: 1,
      stock: 200,
    },
    {
      name: "Twinlock",
      slug: "twinlock",
      category: "Plastic Seals",
      price: 870.00,
      imageUrl: "/assets/twinlock.jpg",
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
      imageUrl: "/assets/twinlock.jpg",
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
      imageUrl: "/assets/padlock.jpg",
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
      imageUrl: "/assets/nylock.jpg",
      description: "Durable Nylon 6 security seal with a 15kg pull strength. Excellent for long-term applications requiring extra durability.",
      unit: "Per 1000",
      minOrder: 1,
      stock: 800,
    },
    {
      name: "Bolt Seal",
      slug: "bolt-seal",
      category: "Bolt Seals",
      price: 96.00,
      imageUrl: "/assets/bolt-seal.jpg",
      description: "High-security bolt seal sold in packs of 12. Ideal for shipping containers and heavy-duty logistics.",
      unit: "Per 12",
      minOrder: 12,
      stock: 1500,
    },
    {
      name: "Cable Lock 500mm",
      slug: "cable-lock-500mm",
      category: "Cable Seals",
      price: 8.50,
      imageUrl: "/assets/cable-lock.jpg",
      description: "High-security cable lock with 500mm length. Mild steel construction for industrial logistics.",
      unit: "Each",
      minOrder: 50,
      stock: 2000,
    },
    {
      name: "Suregas Seal",
      slug: "suregas-seal",
      category: "Specialized Seals",
      price: 800.00,
      imageUrl: "/assets/suretite.jpg",
      description: "Specialized security seal designed for gas cylinders and valve security. Features a large flag for clear identification.",
      unit: "Per 1000",
      minOrder: 1,
      stock: 400,
    },
    {
      name: "ABS Cable Seal",
      slug: "abs-cable-lock",
      category: "Cable Seals",
      price: 199.00,
      imageUrl: "/assets/abs-cable-seal.jpg",
      description: "300mm ABS cable seal for light to medium security applications. Lightweight and durable. Sold in packs.",
      unit: "Per 20",
      minOrder: 1,
      stock: 2000,
    },
    {
      name: "Cable Seal 300mm",
      slug: "cable-seal-300mm",
      category: "Cable Seals",
      price: 225.00,
      imageUrl: "/assets/cable-lock.jpg",
      description: "300mm plastic coated steel cable seal for medium security applications. Sold in packs.",
      unit: "Per 20",
      minOrder: 1,
      stock: 2000,
    },
    {
      name: "Cable Seal 500mm",
      slug: "cable-seal-500mm",
      category: "Cable Seals",
      price: 250.00,
      imageUrl: "/assets/cable-lock.jpg",
      description: "500mm plastic coated steel cable seal for high security applications. Sold in packs.",
      unit: "Per 20",
      minOrder: 1,
      stock: 2000,
    },
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
