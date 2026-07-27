import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendOtpEmail } from "@/lib/email";

function getClient() {
  return createClient({
    url: process.env.DATABASE_URL || "",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
    const displayName = name || email.split("@")[0];

    // Create user WITHOUT emailVerified (pending verification)
    await client.execute({
      sql: `INSERT INTO User (id, name, email, emailVerified, image, passwordHash, phone, company, role) VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?)`,
      args: [id, displayName, email, null, passwordHash, phone || "", company || "", "customer"],
    });

    // Generate OTP and expiry (15 minutes)
    const otp = generateOtp();
    const otpId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // Store OTP in VerificationToken table
    await client.execute({
      sql: `INSERT INTO VerificationToken (id, identifier, token, expires, createdAt) VALUES (?, ?, ?, ?, ?)`,
      args: [otpId, email, otp, expiresAt, new Date().toISOString()],
    });

    // Try sending OTP email, fall back to console log
    let emailSent = false;
    try {
      emailSent = await sendOtpEmail(email, displayName, otp);
    } catch (e) {
      console.error("Failed to send OTP email:", e);
    }

    // Always log the OTP so it works even without SMTP
    console.log(`[OTP] Verification code for ${email}: ${otp}`);

    return NextResponse.json({
      id, name: displayName, email,
      message: emailSent 
        ? "Account created. Check your email for the verification code."
        : "Account created. Check the server logs for your verification code (email not configured).",
      requiresVerification: true,
      redirectTo: `/auth/verify?email=${encodeURIComponent(email)}`,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error: " + (error?.message || "unknown") }, { status: 500 });
  }
}
