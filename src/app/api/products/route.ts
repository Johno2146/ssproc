import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    const isAdmin = (session?.user as any)?.role === "admin";

    const products = await prisma.product.findMany({
      where: isAdmin ? {} : { isActive: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, slug, description, category, price, unit, minOrder, stock, imageUrl, isActive } = body;

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        category,
        price: parseFloat(price),
        unit,
        minOrder: parseInt(minOrder),
        stock: parseInt(stock),
        imageUrl,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
