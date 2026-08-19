import { NextResponse } from "next/server";
import { getClient } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const client = getClient();
    const userRes = await client.execute({
      sql: "SELECT emailVerified FROM User WHERE email = ?",
      args: [email],
    });

    if (userRes.rows.length === 0) {
      return NextResponse.json({ exists: false, verified: false });
    }

    const user = userRes.rows[0] as any;
    const verified = user.emailVerified !== null && user.emailVerified !== undefined && String(user.emailVerified).length > 0;

    return NextResponse.json({
      exists: true,
      verified,
    });
  } catch (error) {
    console.error("Check verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
