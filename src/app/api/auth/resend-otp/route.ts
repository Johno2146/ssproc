import { NextResponse } from "next/server";
import crypto from "crypto";
import { getClient } from "@/lib/db";
import { sendOtpEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const client = getClient();

    // Check user exists
    const userRes = await client.execute({
      sql: "SELECT * FROM User WHERE email = ?",
      args: [email],
    });
    if (userRes.rows.length === 0) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      );
    }
    const user = userRes.rows[0] as any;

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "This email is already verified" },
        { status: 400 }
      );
    }

    // Delete old tokens for this email
    await client.execute({
      sql: "DELETE FROM VerificationToken WHERE identifier = ?",
      args: [email],
    });

    // Generate new 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    // Store new verification token
    await client.execute({
      sql: "INSERT INTO VerificationToken (id, identifier, token, expires, createdAt) VALUES (?, ?, ?, ?, ?)",
      args: [crypto.randomUUID(), email, otp, expires, new Date().toISOString()],
    });

    // Send OTP email
    await sendOtpEmail(email, user.name || "Valued Customer", otp);

    return NextResponse.json(
      { message: "A new verification code has been sent to your email." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend OTP error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
