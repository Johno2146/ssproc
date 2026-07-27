import { NextResponse } from "next/server";

function mask(s: string): string {
  if (!s) return "(empty)";
  if (s.length <= 4) return "***";
  return s.slice(0, 4) + "..." + s.slice(-4);
}

export async function GET() {
  const envs = {
    PAYFAST_SANDBOX: process.env.PAYFAST_SANDBOX || "(not set)",
    PAYFAST_MERCHANT_ID: mask(process.env.PAYFAST_MERCHANT_ID || ""),
    PAYFAST_MERCHANT_KEY: mask(process.env.PAYFAST_MERCHANT_KEY || ""),
    PAYFAST_PASSPHRASE: process.env.PAYFAST_PASSPHRASE ? "(set, length: " + process.env.PAYFAST_PASSPHRASE.length + ")" : "(not set)",
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "(not set)",
    NODE_ENV: process.env.NODE_ENV || "(not set)",
    // Which PayFast URL would be used
    payfast_url: process.env.PAYFAST_SANDBOX === "true"
      ? "https://sandbox.payfast.co.za/eng/process"
      : "https://www.payfast.co.za/eng/process",
  };
  return NextResponse.json(envs);
}
