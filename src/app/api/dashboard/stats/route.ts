import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const totalOrders = await prisma.order.count();
    const pendingOrders = await prisma.order.count({
      where: { status: "pending" },
    });
    const paidOrders = await prisma.order.count({
      where: { status: "paid" },
    });
    const shippedOrders = await prisma.order.count({
      where: { status: "shipped" },
    });
    const totalUsers = await prisma.user.count();
    const totalProducts = await prisma.product.count();

    // Sum total revenue from paid orders
    const paidOrdersData = await prisma.order.findMany({
      where: { status: "paid" },
      select: { total: true },
    });
    const totalRevenue = paidOrdersData.reduce((acc, curr) => acc + curr.total, 0);

    return NextResponse.json({
      totalOrders,
      pendingOrders,
      paidOrders,
      shippedOrders,
      totalUsers,
      totalProducts,
      totalRevenue,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
