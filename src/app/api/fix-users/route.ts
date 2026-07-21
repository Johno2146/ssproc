import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

export async function GET() {
  const client = createClient({
    url: process.env.DATABASE_URL || "",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const result = await client.execute("SELECT email, emailVerified FROM User");

  return NextResponse.json({
    users: result.rows.map((r: any) => ({
      email: r.email,
      emailVerified: r.emailVerified,
    })),
  });
}

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const client = createClient({
    url: process.env.DATABASE_URL || "",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  await client.execute({
    sql: "UPDATE User SET emailVerified = datetime('now') WHERE email = ?",
    args: [email],
  });

  return NextResponse.json({ success: true, email, fixed: true });
}
