import { NextResponse } from "next/server";
// Quote logic lives in src/lib/shippingQuotes.ts (shared with /api/checkout so
// the server can re-validate the customer's selected quote before charging).
import { getShippingQuotes } from "@/lib/shippingQuotes";

export async function POST(req: Request) {
  try {
    const { parcels, weight, destinationPostalCode, destinationCity, destinationZone, parcelValue } = await req.json();
    if (!destinationPostalCode) {
      return NextResponse.json({ error: "Destination postal code is required" }, { status: 400 });
    }
    if ((!parcels || parcels.length === 0) && !weight) {
      return NextResponse.json({ error: "Parcels data or weight is required" }, { status: 400 });
    }
    const shippingParcels = (parcels && parcels.length > 0) ? parcels : [
      { submitted_length_cm: 20, submitted_width_cm: 20, submitted_height_cm: 10, submitted_weight_kg: weight },
    ];
    const quotes = await getShippingQuotes({
      parcels: shippingParcels,
      destinationPostalCode,
      destinationCity,
      destinationZone,
      parcelValue,
    });
    return NextResponse.json({ quotes });
  } catch (error) {
    console.error("Shipping quote error:", error);
    return NextResponse.json({ error: "Failed to get shipping quotes. Please try again." }, { status: 500 });
  }
}