import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL || "",
  authToken: process.env.TURSO_AUTH_TOKEN || "",
});

// TEMPORARY: marks all pending orders as paid. Remove after use.
export async function POST() {
  try {
    const result = await turso.execute({
      sql: `UPDATE "Order" SET status = 'paid', paidAt = ?, updatedAt = datetime('now') WHERE status = 'pending'`,
      args: [new Date().toISOString()],
    });
    return NextResponse.json({ ok: true, updated: result.rowsAffected });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
