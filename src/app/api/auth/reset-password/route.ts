import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getClient } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, otp, password } = await req.json();

    if (!email || !otp || !password) {
      return NextResponse.json({ error: "Email, code, and new password are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const client = getClient();

    // Verify OTP (not expired)
    const now = new Date().toISOString();
    const tokenRes = await client.execute({
      sql: "SELECT * FROM VerificationToken WHERE identifier = ? AND token = ? AND expires > ?",
      args: [email, otp, now],
    });
    if (tokenRes.rows.length === 0) {
      return NextResponse.json({ error: "Invalid or expired reset code" }, { status: 400 });
    }

    // Update password
    const passwordHash = await bcrypt.hash(password, 12);
    await client.execute({
      sql: "UPDATE User SET passwordHash = ?, emailVerified = ? WHERE email = ?",
      args: [passwordHash, new Date().toISOString(), email],
    });

    // Clean up used tokens
    await client.execute({
      sql: "DELETE FROM VerificationToken WHERE identifier = ?",
      args: [email],
    });

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
