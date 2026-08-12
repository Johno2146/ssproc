import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createClient } from "@libsql/client";

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

    const result = await turso.execute({
      sql: `SELECT * FROM ItnLog ORDER BY id DESC LIMIT 20`,
      args: [],
    });

    return NextResponse.json({
      count: result.rows.length,
      logs: result.rows,
      message: result.rows.length === 0 ? "No ITN calls received since last deploy. PayFast is NOT reaching this server." : null,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to read logs" }, { status: 500 });
  }
}
