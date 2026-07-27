import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createClient } from "@libsql/client";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const turso = createClient({
    url: process.env.TURSO_DATABASE_URL || "",
    authToken: process.env.TURSO_AUTH_TOKEN || "",
  });

  // Get user info from session
  const user = session.user as any;

  // Try to find orders for this user
  let orders: any[] = [];
  let dbError: string | null = null;
  
  try {
    const result = await turso.execute({
      sql: `SELECT id, orderNumber, status, total, createdAt FROM "Order" WHERE userId = ? ORDER BY createdAt DESC LIMIT 10`,
      args: [user.id],
    });
    orders = result.rows.map(r => ({ ...r, total: Number(r.total) }));
  } catch (e: any) {
    dbError = e.message || String(e);
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    orderCount: orders.length,
    orders,
    dbError,
    hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
    hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
  });
}
