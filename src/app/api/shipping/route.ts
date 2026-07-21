import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { parcels, weight, destinationPostalCode, destinationCity, destinationZone, parcelValue } = await req.json();

    if (!destinationPostalCode) {
      return NextResponse.json({ error: "Destination postal code is required" }, { status: 400 });
    }
    if ((!parcels || parcels.length === 0) && !weight) {
      return NextResponse.json({ error: "Parcels data or weight is required" }, { status: 400 });
    }

    // Build the parcels array: use provided parcels, or create a single parcel from weight
    const shippingParcels = (parcels && parcels.length > 0) ? parcels : [
      {
        submitted_length_cm: 20,
        submitted_width_cm: 20,
        submitted_height_cm: 10,
        submitted_weight_kg: weight,
      },
    ];

    const quotes: { provider: string; service: string; price: number; estimatedDays: string }[] = [];

    // The Courier Guy API
    const cgToken = process.env.COURIER_GUY_BEARER_TOKEN;
    const cgApiUrl = process.env.COURIER_GUY_API_URL || "https://api.portal.thecourierguy.co.za";
    if (cgToken) {
      try {
        const cgRes = await fetch(`${cgApiUrl}/rates`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${cgToken}`,
          },
          body: JSON.stringify({
            collection_address: {
              type: "business",
              company: "Sealed and Secured",
              street_address: "Eastwood Business Park, 23 Wright Street",
              local_area: "Nuffield",
              city: "Springs",
              zone: "Gauteng",
              country: "ZA",
              code: process.env.SHIPPING_ORIGIN_POSTAL_CODE || "1559",
            },
            delivery_address: {
              type: "residential",
              company: "",
              street_address: "1 Main Road",
              local_area: destinationCity || "",
              city: destinationCity || "",
              zone: destinationZone || "Gauteng",
              country: "ZA",
              code: destinationPostalCode,
            },
            parcels: shippingParcels,
            ...(parcelValue ? { declared_value: parcelValue } : {}),
          }),
        });
        if (cgRes.ok) {
          const cgData = await cgRes.json();
          if (cgData.rates && Array.isArray(cgData.rates)) {
            cgData.rates.forEach((rate: any) => {
              const serviceName = rate.service_level?.name || rate.service_level?.code || "Standard";
              const totalPrice = rate.rate || rate.rate_excluding_vat || 0;
              // Estimate delivery days from the service dates
              let estDays = "1-3";
              if (rate.service_level?.delivery_date_from && rate.service_level?.delivery_date_to) {
                const from = new Date(rate.service_level.delivery_date_from);
                const to = new Date(rate.service_level.delivery_date_to);
                const fromDays = Math.ceil((from.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const toDays = Math.ceil((to.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                estDays = `${Math.max(1, fromDays)}-${Math.max(1, toDays)}`;
              }
              quotes.push({
                provider: "The Courier Guy",
                service: serviceName,
                price: totalPrice,
                estimatedDays: estDays,
              });
            });
          }
        } else {
          const errText = await cgRes.text();
          console.error("Courier Guy error response:", cgRes.status, errText);
        }
      } catch (e) {
        console.error("Courier Guy fetch error:", e);
      }
    }

    // Pudo
    const pudoKey = process.env.PUDO_API_KEY;
    if (pudoKey) {
      try {
        const pudoRes = await fetch("https://api.pudo.co.za/v1/rates", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": pudoKey,
          },
          body: JSON.stringify({
            weight_kg: weight,
            origin_postal_code: process.env.SHIPPING_ORIGIN_POSTAL_CODE || "1559",
            destination_postal_code: destinationPostalCode,
            ...(parcelValue ? { parcel_value: parcelValue } : {}),
          }),
        });
        if (pudoRes.ok) {
          const pudoData = await pudoRes.json();
          if (pudoData.rates) {
            pudoData.rates.forEach((rate: any) => {
              quotes.push({
                provider: "Pudo",
                service: rate.service || rate.name || "Pudo Locker",
                price: rate.price || rate.total || 0,
                estimatedDays: rate.transit_days || "2-5",
              });
            });
          }
        }
      } catch (e) {
        console.error("Pudo error:", e);
      }
    }

    // Sort by price ascending
    quotes.sort((a, b) => a.price - b.price);

    return NextResponse.json({ quotes });
  } catch (error) {
    console.error("Shipping quote error:", error);
    return NextResponse.json({ error: "Failed to get shipping quotes. Please try again." }, { status: 500 });
  }
}