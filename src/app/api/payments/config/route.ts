import { NextResponse } from "next/server";
import { isStitchConfigured } from "@/lib/stitch";

/**
 * Public payment-config endpoint (no secrets exposed — boolean only).
 * CheckoutPage uses it to decide whether to offer "Card (Stitch)".
 * When STITCH_CLIENT_ID / STITCH_CLIENT_SECRET are absent (owner hasn't
 * saved them yet), the Stitch option is hidden and the store keeps selling
 * via PayFast. Safe default on fetch failure is PayFast-only.
 */
export async function GET() {
  return NextResponse.json({
    stitch: { enabled: isStitchConfigured() },
    payfast: { enabled: true },
  });
}