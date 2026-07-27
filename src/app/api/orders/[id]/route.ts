import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import { auth } from "@/lib/auth";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL || "",
  authToken: process.env.TURSO_AUTH_TOKEN || "",
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const result = await turso.execute({
      sql: `SELECT * FROM "Order" WHERE id = ?`,
      args: [id],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = result.rows[0];

    // Only allow admin or the order owner
    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;
    if (userRole !== "admin" && order.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch order items
    const itemsResult = await turso.execute({
      sql: `SELECT * FROM OrderItem WHERE orderId = ?`,
      args: [id],
    });

    // Try to get product names from Product table
    const items = [];
    for (const item of itemsResult.rows) {
      let productName = item.productId;
      try {
        const prodResult = await turso.execute({
          sql: `SELECT name FROM Product WHERE id = ?`,
          args: [item.productId],
        });
        if (prodResult.rows.length > 0) {
          productName = prodResult.rows[0].name;
        }
      } catch {}
      items.push({
        ...item,
        productName,
        price: Number(item.price),
        quantity: Number(item.quantity),
      });
    }

    return NextResponse.json({
      ...order,
      total: Number(order.total),
      items,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    await turso.execute({
      sql: `UPDATE "Order" SET status = ?, updatedAt = datetime('now') WHERE id = ?`,
      args: [status, id],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
