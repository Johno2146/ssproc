import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Winfreight (Iconnix) shipping quotes — verified live 2026-08-14
//
// Endpoints (HTTPS, HTTP Basic auth as the API user):
//   GetHubCode  -> list of { HubCode, Suburb, City, Province, PostalCode }
//   GetServCode -> list of valid service codes
//   GetQuote_2025 -> quote for ONE service code
//
// Quote params:
//   Accnum (SEA003), GroupName (GearUp), ServC (one service code),
//   Orig (suburb/city name), Orig_Code (HUB code, e.g. JNB / JNB1 / CPT),
//   Dest (suburb/city name), Dest_Code (hub code),
//   d_Wayb_Weight_temp (kg), Items (parcel count),
//   Length / Width / Height (cm, max across parcels)
//
// Response row fields: GrandTotal (incl. VAT), SubTotal, VAT, TotalFreight,
// TotalFuel, ServiceCode, QuoteNumber, Weight, ChargeableWeight, DestCode ...
// A row with GrandTotal == 0 means the service has no rate on that route.
// ---------------------------------------------------------------------------

const WF_SERVICES = [
  "C/Store", "EBS", "INTER", "LOC", "NDS", "ONR", "ONX", "PP", "RFS", "SAT", "SDX", "SDXD", "Truck",
];

// Friendly names for the GearUp service codes (from GetServCode).
const SERVICE_LABELS: Record<string, string> = {
  "C/Store": "Counter to Counter",
  EBS: "Economy Box Service",
  INTER: "International",
  LOC: "Local",
  NDS: "Next Day Service",
  ONR: "Overnight Road",
  ONX: "Overnight Express",
  PP: "Pudo Point",
  RFS: "Road Freight Service",
  SAT: "Saturday Delivery",
  SDX: "Same Day Express",
  SDXD: "Same Day Direct",
  Truck: "Trucking",
};

// The Winfreight quote response has no ETA field, so estimates are derived
// from the service type itself (standard courier definitions).
const SERVICE_ETA: Record<string, string> = {
  SDX: "0", SDXD: "0", LOC: "0", NDS: "1", ONR: "1", ONX: "1",
  EBS: "1-3", RFS: "2-5", SAT: "1", PP: "1-2", "C/Store": "1-3",
  INTER: "3-10", Truck: "2-7",
};

let hubCache: { rows: any[]; fetchedAt: number } | null = null;
const HUB_TTL_MS = 24 * 60 * 60 * 1000;

function normalize(s: string): string {
  return (s || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

async function getHubRows(base: string, basic: string, params: URLSearchParams): Promise<any[]> {
  if (hubCache && Date.now() - hubCache.fetchedAt < HUB_TTL_MS) return hubCache.rows;
  try {
    const res = await fetch(`${base}/GetHubCode?${params.toString()}`, {
      headers: { Authorization: `Basic ${basic}` },
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      const rows = data?.ResultSets?.[0] ?? [];
      if (Array.isArray(rows) && rows.length > 0) {
        hubCache = { rows, fetchedAt: Date.now() };
        return rows;
      }
    }
  } catch (e) {
    console.error("GetHubCode fetch error:", e);
  }
  return hubCache ? hubCache.rows : [];
}

/**
 * Resolve a customer's city + postal code to a { Dest, Dest_Code } pair the
 * quote procedure accepts. Returns null when nothing matches (caller then
 * falls back to Courier Guy so checkout never breaks).
 */
function resolveDestination(
  hubs: any[],
  city: string,
  postal: string
): { Dest: string; Dest_Code: string } | null {
  if (!hubs.length) return null;
  const c = normalize(city);
  const p = (postal || "").trim();
  if (!c && !p) return null;

  // 1) Exact suburb OR city match + matching postal code
  if (c && p) {
    const hit = hubs.find(
      (r) => r.PostalCode === p && (normalize(r.Suburb) === c || normalize(r.City) === c)
    );
    if (hit) {
      return {
        Dest: normalize(hit.Suburb) === c ? hit.Suburb : hit.City,
        Dest_Code: hit.HubCode,
      };
    }
  }
  // 2) Suburb or city name match alone
  if (c) {
    const hit = hubs.find((r) => normalize(r.Suburb) === c || normalize(r.City) === c);
    if (hit) {
      return {
        Dest: normalize(hit.Suburb) === c ? hit.Suburb : hit.City,
        Dest_Code: hit.HubCode,
      };
    }
  }
  // 3) Postal code match alone
  if (p) {
    const hit = hubs.find((r) => r.PostalCode === p);
    if (hit) return { Dest: hit.Suburb, Dest_Code: hit.HubCode };
  }
  return null;
}

/** Run one GetQuote_2025 call for a single service and return the price. */
async function wfQuote(
  base: string,
  basic: string,
  common: URLSearchParams,
  service: string
): Promise<{ price: number; row: any } | null> {
  const params = new URLSearchParams(common);
  params.set("ServC", service);
  try {
    const res = await fetch(`${base}/GetQuote_2025?${params.toString()}`, {
      headers: { Authorization: `Basic ${basic}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    if (!data) return null;
    const rows = data.ResultSets?.[0] ?? [];
    for (const row of rows) {
      if (!row || typeof row !== "object") continue;
      if (String(row.RESULT ?? "").toUpperCase().includes("ERROR")) continue;
      let price = Number(row.GrandTotal);
      if (!isFinite(price) || price <= 0) {
        const sub = Number(row.SubTotal);
        const vat = Number(row.VAT);
        if (isFinite(sub) && sub > 0) price = isFinite(vat) && vat > 0 ? sub + vat : sub;
      }
      if (isFinite(price) && price > 0) return { price, row };
    }
    return null;
  } catch (e) {
    console.error(`Winfreight quote error (${service}):`, e);
    return null;
  }
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
    const shippingParcels = (parcels && parcels.length > 0) ? parcels : [
      { submitted_length_cm: 20, submitted_width_cm: 20, submitted_height_cm: 10, submitted_weight_kg: weight },
    ];
    const quotes: { provider: string; service: string; price: number; estimatedDays: string }[] = [];

    // ------------------------------------------------------------------
    // Winfreight / GearUp (primary, verified live)
    // ------------------------------------------------------------------
    const wfUrlRaw = process.env.WINFRIGHT_API_URL;
    const wfUser = process.env.WINFRIGHT_USERNAME;
    const wfPass = process.env.WINFRIGHT_PASSWORD;
    const wfGroup = process.env.WINFRIGHT_GROUPNAME;
    const wfAccnum = process.env.WINFRIGHT_ACCNUM;
    if (wfUrlRaw && wfUser && wfPass && wfGroup && wfAccnum) {
      try {
        const wfUrl = wfUrlRaw.replace(/\/?$/, "").replace(/^http:\/\//i, "https://");
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

        const authParams = new URLSearchParams({ Accnum: wfAccnum, GroupName: wfGroup });
        const hubs = await getHubRows(wfUrl, basic, authParams);
        const dest = resolveDestination(hubs, destinationCity || "", destinationPostalCode);

        if (dest) {
          const common = new URLSearchParams({
            Accnum: wfAccnum,
            GroupName: wfGroup,
            Orig: process.env.WINFRIGHT_ORIGIN || "ASTON LAKE",
            Orig_Code: process.env.WINFRIGHT_ORIGIN_CODE || "JNB",
            Dest: dest.Dest,
            Dest_Code: dest.Dest_Code,
            d_Wayb_Weight_temp: String(Math.max(0.1, totalWeight)),
            Items: String(shippingParcels.length || 1),
            Length: String(length),
            Width: String(width),
            Height: String(height),
            ...(parcelValue ? { d_Wayb_Value_temp: String(parcelValue) } : {}),
          });

          const results = await Promise.all(
            WF_SERVICES.map((svc) => wfQuote(wfUrl, basic, common, svc))
          );
          for (const r of results) {
            if (!r) continue;
            const code = String(r.row.ServiceCode || "").trim();
            quotes.push({
              provider: "GearUp",
              service: SERVICE_LABELS[code] ? `${SERVICE_LABELS[code]} (${code})` : code || "Standard",
              price: r.price,
              estimatedDays: SERVICE_ETA[code] || "1-3",
            });
          }
          if (quotes.length === 0) {
            console.error("Winfreight: no valid rates for", dest.Dest, destinationPostalCode);
          }
        } else {
          console.error("Winfreight: destination not found in hub list:", destinationCity, destinationPostalCode);
        }
      } catch (e) {
        console.error("Winfreight fetch error:", e);
      }
    }

    // ------------------------------------------------------------------
    // The Courier Guy — safety net ONLY when Winfreight returned nothing
    // ------------------------------------------------------------------
    if (quotes.length === 0) {
      const cgKey = process.env.COURIER_GUY_API_KEY || process.env.THE_COURIER_GUY_API_KEY;
      if (cgKey) {
        try {
          const cgRes = await fetch("https://api.thecourierguy.co.za/api/v1/rates", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Basic ${Buffer.from(cgKey).toString("base64")}`,
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
            console.error("Courier Guy error response:", cgRes.status, await cgRes.text());
          }
        } catch (e) {
          console.error("Courier Guy fetch error:", e);
        }
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
