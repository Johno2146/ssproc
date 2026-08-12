import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { auth } from "@/lib/auth";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL || "",
  authToken: process.env.TURSO_AUTH_TOKEN || "",
});

export async function GET() {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let totalOrders = 0;
    let pendingOrders = 0;
    let paidOrders = 0;
    let shippedOrders = 0;
    let totalRevenue = 0;
    let totalUsers = 0;
    let totalProducts = 0;

    // Order stats - admins see all, customers see their own
    if (userRole === "admin") {
      const totalResult = await turso.execute({ sql: `SELECT COUNT(*) as count FROM "Order"`, args: [] });
      totalOrders = Number(totalResult.rows[0]?.count || 0);

      const pendingResult = await turso.execute({ sql: `SELECT COUNT(*) as count FROM "Order" WHERE status = 'pending'`, args: [] });
      pendingOrders = Number(pendingResult.rows[0]?.count || 0);

      const paidResult = await turso.execute({ sql: `SELECT COUNT(*) as count FROM "Order" WHERE status = 'paid'`, args: [] });
      paidOrders = Number(paidResult.rows[0]?.count || 0);

      const shippedResult = await turso.execute({ sql: `SELECT COUNT(*) as count FROM "Order" WHERE status = 'shipped'`, args: [] });
      shippedOrders = Number(shippedResult.rows[0]?.count || 0);

      const revenueResult = await turso.execute({ sql: `SELECT COALESCE(SUM(total), 0) as total FROM "Order" WHERE status = 'paid'`, args: [] });
      totalRevenue = Number(revenueResult.rows[0]?.total || 0);

      const usersResult = await turso.execute({ sql: `SELECT COUNT(*) as count FROM User`, args: [] });
      totalUsers = Number(usersResult.rows[0]?.count || 0);

      const productsResult = await turso.execute({ sql: `SELECT COUNT(*) as count FROM Product`, args: [] });
      totalProducts = Number(productsResult.rows[0]?.count || 0);
    } else {
      const totalResult = await turso.execute({ sql: `SELECT COUNT(*) as count FROM "Order" WHERE userId = ?`, args: [userId] });
      totalOrders = Number(totalResult.rows[0]?.count || 0);

      const pendingResult = await turso.execute({ sql: `SELECT COUNT(*) as count FROM "Order" WHERE userId = ? AND status = 'pending'`, args: [userId] });
      pendingOrders = Number(pendingResult.rows[0]?.count || 0);

      const paidResult = await turso.execute({ sql: `SELECT COUNT(*) as count FROM "Order" WHERE userId = ? AND status = 'paid'`, args: [userId] });
      paidOrders = Number(paidResult.rows[0]?.count || 0);

      const shippedResult = await turso.execute({ sql: `SELECT COUNT(*) as count FROM "Order" WHERE userId = ? AND status = 'shipped'`, args: [userId] });
      shippedOrders = Number(shippedResult.rows[0]?.count || 0);

      const revenueResult = await turso.execute({ sql: `SELECT COALESCE(SUM(total), 0) as total FROM "Order" WHERE userId = ? AND status = 'paid'`, args: [userId] });
      totalRevenue = Number(revenueResult.rows[0]?.total || 0);
    }

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
