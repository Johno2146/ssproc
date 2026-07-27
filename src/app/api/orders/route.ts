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
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    let result;
    if (userRole === "admin") {
      result = await turso.execute({
        sql: `SELECT * FROM "Order" ORDER BY createdAt DESC`,
        args: [],
      });
    } else {
      result = await turso.execute({
        sql: `SELECT * FROM "Order" WHERE userId = ? ORDER BY createdAt DESC`,
        args: [userId],
      });
    }

    // Fetch items for each order
    const orders = [];
    for (const order of result.rows) {
      const itemsResult = await turso.execute({
        sql: `SELECT * FROM OrderItem WHERE orderId = ?`,
        args: [order.id],
      });
      const items = itemsResult.rows.map(item => ({
        ...item,
        price: Number(item.price),
        quantity: Number(item.quantity),
      }));
      orders.push({
        ...order,
        total: Number(order.total),
        items,
      });
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
