// Server-side shipping quote engine — used by BOTH the public /api/shipping
// endpoint (for the checkout UI) and the /api/checkout route (to re-validate
// the customer's selected quote before charging it). Never trust the browser's
// shipping cost: checkout calls getShippingQuotes() with the cart's real
// parcels and matches the selected provider+service against the returned list.

// Winfreight (Iconnix) shipping quotes — verified live 2026-08-14
//   GetQuote_2025 params: Accnum (SEA003), GroupName (GearUp), ServC,
//   Orig/Orig_Code (NUFFIELD/JNB), Dest/Dest_Code, d_Wayb_Weight_temp (kg),
//   Items, Length/Width/Height (cm, max across parcels).
//   Response: GrandTotal (incl. VAT), SubTotal, VAT, ServiceCode, ...
import bundledHubs from "../data/hubs.json";

const WF_SERVICES = [
  "C/Store", "EBS", "INTER", "LOC", "NDS", "ONR", "ONX", "PP", "RFS", "SAT", "SDX", "SDXD", "Truck",
];

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

const SERVICE_ETA: Record<string, string> = {
  SDX: "0", SDXD: "0", LOC: "0", NDS: "1", ONR: "1", ONX: "1",
  EBS: "1-3", RFS: "2-5", SAT: "1", PP: "1-2", "C/Store": "1-3",
  INTER: "3-10", Truck: "2-7",
};

export interface ShippingQuote {
  provider: string;
  service: string;
  price: number;
  estimatedDays: string;
}

let hubCache: { rows: any[]; fetchedAt: number } | null = null;
let hubRefreshInFlight = false;
const HUB_TTL_MS = 24 * 60 * 60 * 1000;

function normalize(s: string): string {
  return (s || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

async function refreshHubRows(base: string, basic: string, params: URLSearchParams) {
  if (hubRefreshInFlight) return;
  hubRefreshInFlight = true;
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
      }
    }
  } catch (e) {
    console.error("GetHubCode refresh error:", e);
  } finally {
    hubRefreshInFlight = false;
  }
}

async function getHubRows(base: string, basic: string, params: URLSearchParams): Promise<any[]> {
  if (hubCache && Date.now() - hubCache.fetchedAt < HUB_TTL_MS) return hubCache.rows;
  const bundled = (bundledHubs as any)?.rows ?? [];
  if (!hubCache) hubCache = { rows: bundled, fetchedAt: Date.now() - HUB_TTL_MS + 60_000 };
  refreshHubRows(base, basic, params);
  return hubCache.rows.length ? hubCache.rows : bundled;
}

function resolveDestination(
  hubs: any[],
  city: string,
  postal: string
): { Dest: string; Dest_Code: string } | null {
  if (!hubs.length) return null;
  const c = normalize(city);
  const p = (postal || "").trim();
  if (!c && !p) return null;
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
  if (c) {
    const hit = hubs.find((r) => normalize(r.Suburb) === c || normalize(r.City) === c);
    if (hit) {
      return {
        Dest: normalize(hit.Suburb) === c ? hit.Suburb : hit.City,
        Dest_Code: hit.HubCode,
      };
    }
  }
  if (p) {
    const hit = hubs.find((r) => r.PostalCode === p);
    if (hit) return { Dest: hit.Suburb, Dest_Code: hit.HubCode };
  }
  return null;
}

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

export interface ShippingRequest {
  parcels: {
    submitted_length_cm: number;
    submitted_width_cm: number;
    submitted_height_cm: number;
    submitted_weight_kg: number;
  }[];
  destinationPostalCode: string;
  destinationCity?: string;
  destinationZone?: string;
  parcelValue?: number;
}

export async function getShippingQuotes(req: ShippingRequest): Promise<ShippingQuote[]> {
  const { parcels, destinationPostalCode, destinationCity, destinationZone, parcelValue } = req;
  if (!destinationPostalCode) return [];
  const shippingParcels = (parcels && parcels.length > 0) ? parcels : [];
  const quotes: ShippingQuote[] = [];

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
          Orig: process.env.WINFRIGHT_ORIGIN || "NUFFIELD",
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

  // The Courier Guy — safety net ONLY when Winfreight returned nothing
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

  quotes.sort((a, b) => a.price - b.price);
  return quotes;
}