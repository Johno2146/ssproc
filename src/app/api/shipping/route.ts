import { NextResponse } from "next/server";
// Flat-rate delivery — OWNER RULE (2026-09-29). No external quote calls.
import {
  computeFlatShipping,
  parsePackSize,
  type FlatShippingLine,
} from "@/lib/shippingFlat";

// Returns the flat-rate delivery fee for the given cart lines. The definitive
// price is still enforced in POST /api/checkout (server-authoritative); this
// endpoint exists for display/verification only.
export async function POST(req: Request) {
  try {
    const { items = [], parcels, weight } = await req.json();

    let lines: FlatShippingLine[] = [];
    if (Array.isArray(items) && items.length > 0) {
      lines = items.map((it: any) => ({
        category: it.category || '',
        packSize: it.packSize != null ? Number(it.packSize) : parsePackSize(it.unit || it.packLabel || ''),
        quantity: Number(it.quantity) || (Array.isArray(parcels) ? parcels.length : 0),
      }));
    } else if (Array.isArray(parcels) && parcels.length > 0) {
      // Legacy shape: one line per parcel, quantity 1 each — category/unit
      // unknown, so no seal pieces; the fee is the standard flat rate (or the
      // over-5-boxes error if there are more than 5 parcels).
      lines = parcels.map(() => ({ category: '', packSize: 0, quantity: 1 }));
    } else if (weight) {
      lines = [{ category: '', packSize: 0, quantity: 1 }];
    }

    const flat = computeFlatShipping(lines);
    return NextResponse.json({
      quotes: flat.error
        ? []
        : [{ provider: "Flat Rate", service: flat.shippingService, price: flat.shippingCost, estimatedDays: "2-5" }],
      flat,
    });
  } catch (error) {
    console.error("Shipping quote error:", error);
    return NextResponse.json({ error: "Failed to get shipping quotes. Please try again." }, { status: 500 });
  }
}