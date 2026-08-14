import { NextResponse } from "next/server";

/**
 * Shipping quotes endpoint.
 *
 * Primary provider: Winfreight (iconnix cloud platform) — `GetQuote` stored-procedure wrapper.
 * Credentials come from env vars (set on Vercel):
 *   WINFRIGHT_API_URL      e.g. http://cloudplatform.iconnix.co.za/WinfreightAPI/
 *   WINFRIGHT_USERNAME     API user (e.g. SealedSecure)
 *   WINFRIGHT_PASSWORD     API password
 *   WINFRIGHT_GROUPNAME    group (e.g. GearUp)
 *   WINFRIGHT_ACCNUM       customer account number with the courier (required by stp_GetQuote)
 *   WINFRIGHT_SERVICE_CODE optional service code override (default "EC")
 *   WINFRIGHT_ORIGIN / WINFRIGHT_ORIGIN_CODE  optional origin station name/code (default Springs/1559)
 *
 * Fallback: The Courier Guy is only used while Winfreight is not configured or has not yet
 * returned verified quotes — it will be removed once the Winfreight cutover is complete.
 */

function pickPrice(row: Record<string, any>): number | null {
  const candidates = [
    "Rate", "RATE", "Price", "PRICE", "Total", "TOTAL", "Amount", "AMOUNT",
    "Cost", "COST", "Charge", "CHARGE", "Value", "VALUE", "TotalExcl", "TotalIncl",
    "Wayb_Amount", "Wayb_Value", "Freight", "FREIGHT", "SubTotal",
  ];
  for (const key of candidates) {
    const v = row[key];
    if (v !== undefined && v !== null && v !== "" && !isNaN(Number(v))) return Number(v);
  }
  // Fall back: first numeric-looking value in the row that is not a weight/length/count field
  for (const [k, v] of Object.entries(row)) {
    if (/weight|mass|length|height|width|qty|items|parcel|code|id|ref|date|result|vol|dim/i.test(k)) continue;
    if (v !== undefined && v !== null && v !== "" && !isNaN(Number(v))) return Number(v);
  }
  return null;
}

function pickService(row: Record<string, any>): string {
  const candidates = ["Service", "SERVICE", "ServiceDesc", "ServDesc", "Serv_Desc", "ServiceName",
    "Description", "DESCRIPTION", "Product", "PRODUCT", "Type", "TYPE", "ServC", "Name", "NAME"];
  for (const key of candidates) {
    const v = row[key];
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
  }
  return "Standard";
}

function pickEta(row: Record<string, any>): string {
  const dateKeys = ["EtaDate", "ETA", "Eta", "DeliveryDate", "Delivery_Date", "EstDelivery", "TransitDays", "Days"];
  for (const key of dateKeys) {
    const v = row[key];
    if (v === undefined || v === null || v === "") continue;
    const s = String(v);
    const d = Date.parse(s);
    if (!isNaN(d)) {
      const days = Math.ceil((d - Date.now()) / (1000 * 60 * 60 * 24));
      return `${Math.max(1, days)}`;
    }
    if (/\d/.test(s)) return s.trim();
  }
  return "1-3";
}

/** Extract quote rows from the Winfreight ResultSets envelope. */
function parseWinfreightRows(data: any): Record<string, any>[] {
  const sets: any[][] = data?.ResultSets ?? [];
  const rows: Record<string, any>[] = [];
  for (const set of sets) {
    if (!Array.isArray(set)) continue;
    for (const row of set) {
      if (!row || typeof row !== "object") continue;
      const res = String(row.RESULT ?? "");
      if (res.toUpperCase().includes("ERROR")) continue;
      rows.push(row);
    }
  }
  // Also scan output parameters for a numeric result (some wrappers return totals there)
  const out = data?.OutputParameters;
  if (out && typeof out === "object") {
    for (const [k, v] of Object.entries(out)) {
      if (v !== null && v !== undefined && v !== "" && !isNaN(Number(v)) && !/weight|length|qty/i.test(k)) {
        rows.push({ Service: k.replace(/^@/, ""), Total: Number(v) });
      }
    }
  }
  return rows;
}

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

    // ------------------------------------------------------------------
    // Winfreight (primary)
    // ------------------------------------------------------------------
    const wfUrl = process.env.WINFRIGHT_API_URL;
    const wfUser = process.env.WINFRIGHT_USERNAME;
    const wfPass = process.env.WINFRIGHT_PASSWORD;
    const wfGroup = process.env.WINFRIGHT_GROUPNAME;
    const wfAccnum = process.env.WINFRIGHT_ACCNUM;

    if (wfUrl && wfUser && wfPass && wfGroup) {
      try {
        const basic = Buffer.from(`${wfUser}:${wfPass}`).toString("base64");

        const totalWeight = shippingParcels.reduce(
          (sum: number, p: any) => sum + (Number(p.submitted_weight_kg) || 0),
          0
        );
        const dims = shippingParcels.map((p: any) => ({
          l: Number(p.submitted_length_cm) || 0,
          w: Number(p.submitted_width_cm) || 0,
          h: Number(p.submitted_height_cm) || 0,
        }));
        const length = Math.max(1, ...dims.map((d: any) => d.l));
        const width = Math.max(1, ...dims.map((d: any) => d.w));
        const height = Math.max(1, ...dims.map((d: any) => d.h));

        const params = new URLSearchParams({
          Accnum: wfAccnum || wfGroup,
          GroupName: wfGroup,
          ServC: process.env.WINFRIGHT_SERVICE_CODE || "EC",
          Orig: process.env.WINFRIGHT_ORIGIN || "Springs",
          Orig_Code: process.env.WINFRIGHT_ORIGIN_CODE || "1559",
          Dest: destinationCity || destinationPostalCode,
          Dest_Code: destinationPostalCode,
          d_Wayb_Weight_temp: String(Math.max(0.1, totalWeight)),
          Items: String(shippingParcels.length || 1),
          Length: String(length),
          Width: String(width),
          Height: String(height),
          ...(parcelValue ? { d_Wayb_Value_temp: String(parcelValue) } : {}),
        });

        const wfRes = await fetch(`${wfUrl.replace(/\/?$/, "/")}GetQuote?${params.toString()}`, {
          headers: { Authorization: `Basic ${basic}` },
          cache: "no-store",
        });

        const wfData = await wfRes.json().catch(() => ({}));
        const rows = parseWinfreightRows(wfData);
        if (rows.length > 0) {
          rows.forEach((row) => {
            const price = pickPrice(row);
            if (price === null) return;
            quotes.push({
              provider: "Winfreight",
              service: pickService(row),
              price,
              estimatedDays: pickEta(row),
            });
          });
        } else {
          console.error("Winfreight quote error:", JSON.stringify(wfData).slice(0, 500));
        }
      } catch (e) {
        console.error("Winfreight fetch error:", e);
      }
    }

    // ------------------------------------------------------------------
    // The Courier Guy (temporary fallback until Winfreight is verified)
    // ------------------------------------------------------------------
    if (quotes.length === 0) {
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
    }

    // Pudo (optional, only if a key is configured)
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
