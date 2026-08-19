import { NextResponse } from "next/server";
import { getClient } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and verification code are required" },
        { status: 400 }
      );
    }
    const client = getClient();

    // Find the verification token (not expired). ISO timestamps compare lexicographically.
    const now = new Date().toISOString();
    const tokenRes = await client.execute({
      sql: "SELECT * FROM VerificationToken WHERE identifier = ? AND token = ? AND expires > ?",
      args: [email, otp, now],
    });
    if (tokenRes.rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired verification code. Please request a new one." },
        { status: 400 }
      );
    }

    // Mark user as verified
    const userRes = await client.execute({
      sql: "SELECT email FROM User WHERE email = ?",
      args: [email],
    });
    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    await client.execute({
      sql: "UPDATE User SET emailVerified = ? WHERE email = ?",
      args: [new Date().toISOString(), email],
    });

    // Delete the used token
    await client.execute({
      sql: "DELETE FROM VerificationToken WHERE identifier = ? AND token = ?",
      args: [email, otp],
    });

    // Clean up the pending OTP setting
    try {
      await client.execute({
        sql: "DELETE FROM Setting WHERE key = ?",
        args: [`pending_otp_${email}`],
      });
    } catch {
      // Setting might not exist, that's fine
    }

    return NextResponse.json({ message: "Email verified successfully" }, { status: 200 });
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
