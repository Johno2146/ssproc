import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

function getClient() {
  return createClient({
    url: process.env.DATABASE_URL || "",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

export async function POST(req: Request) {
  try {
    const { name, email, password, phone, company } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const client = getClient();

    // Check existing
    const existing = await client.execute({
      sql: "SELECT id FROM User WHERE email = ?",
      args: [email],
    });
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const displayName = name || email.split("@")[0];

    await client.execute({
      sql: `INSERT INTO User (id, name, email, "emailVerified", image, passwordHash, phone, company, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, displayName, email, now, null, passwordHash, phone || "", company || "", "customer"],
    });

    return NextResponse.json({
      id, name: displayName, email,
      message: "Account created successfully. You can now sign in.",
    }, { status: 201 });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error: " + (error?.message || "unknown") }, { status: 500 });
  }
}
