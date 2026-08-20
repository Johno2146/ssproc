import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import crypto from "crypto";

import { createClient } from "@libsql/client";
import { isCollectableCategory } from "@/lib/collectionPolicy";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL || "",
  authToken: process.env.TURSO_AUTH_TOKEN || "",
});

const PAYFAST_URL = process.env.PAYFAST_SANDBOX === "true"
  ? "https://sandbox.payfast.co.za/eng/process"
  : "https://www.payfast.co.za/eng/process";

function generatePayFastSignature(data: Record<string, string>, passphrase?: string): string {
  // Build sorted key=value pairs with PayFast-compliant encoding (+ for spaces, not %20)
  const keys = Object.keys(data).filter(k => k !== 'signature').sort();
  let paramString = keys
    .map(k => `${k}=${encodeURIComponent(data[k].trim()).replace(/%20/g, '+')}`)
    .join('&');
  // Passphrase must NOT be URL-encoded per PayFast spec
  if (passphrase && passphrase.trim()) {
    paramString += '&passphrase=' + passphrase.trim();
  }
  return crypto.createHash('md5').update(paramString).digest('hex');
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { items, shippingDetails, companyDetails, billingAddress, shipping } = body;

    // Validate items
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }
    // Server-side enforcement: Collection is only available for non-cable-tie products.
    if (shipping?.method === 'collection') {
      for (const item of items) {
        const productRes = await turso.execute({
          sql: "SELECT category FROM Product WHERE id = ?",
          args: [item.productId],
        });
        const category = productRes.rows[0]?.category as string | undefined;
        if (!category || !isCollectableCategory(category)) {
          return NextResponse.json(
            { error: "Collection is not available for this order. Please select delivery." },
            { status: 400 }
          );
        }
      }
    }

    // 1. Create order in database — generate sequential order number
    let orderNumber = `SS-${Date.now()}`; // fallback
    try {
      // Ensure counter table exists
      await turso.execute({ sql: `CREATE TABLE IF NOT EXISTS Counter (name TEXT PRIMARY KEY, value INTEGER NOT NULL)` });
      // Atomic increment and read the next sequence (starts at 1000 to look established)
      const counterResult = await turso.execute({
        sql: `INSERT INTO Counter (name, value) VALUES ('orderNumber', 1000)
              ON CONFLICT(name) DO UPDATE SET value = value + 1
              RETURNING value`,
        args: [],
      });
      const seq = Number(counterResult.rows[0]?.value || 0);
      if (seq > 0) {
        orderNumber = `SS-${seq}`;
      }
    } catch (e) {
      console.error("Failed to generate sequential order number, falling back to timestamp:", e);
    }

    const total = items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);
    const VAT_RATE = 0.15;
    const vat = total * VAT_RATE;
    const grandTotal = total + vat;

    // Build delivery address string
    const deliveryAddrStr = [shipping?.street, shipping?.suburb, shipping?.city, shipping?.province, shipping?.postalCode]
      .filter(Boolean).join(', ');

    // Build billing address string
    const billingAddrStr = billingAddress 
      ? [billingAddress.address, billingAddress.city, billingAddress.postalCode].filter(Boolean).join(', ')
      : '';

    // Create order in Turso
    const orderId = crypto.randomUUID();
    // Build notes with company/vat/address if provided
    const notesParts = [];
    if (companyDetails?.companyName) notesParts.push('Company: ' + companyDetails.companyName);
    if (companyDetails?.vatNumber) notesParts.push('VAT: ' + companyDetails.vatNumber);
    if (deliveryAddrStr) notesParts.push('Delivery: ' + deliveryAddrStr);
    if (billingAddrStr) notesParts.push('Billing: ' + billingAddrStr);
    const notes = notesParts.join(' | ') || null;
    
    await turso.execute({
      sql: `INSERT INTO "Order" (id, orderNumber, userId, status, total, shippingName, shippingPhone, shippingEmail, notes, createdAt, updatedAt) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      args: [orderId, orderNumber, (session.user as any).id, grandTotal, shippingDetails.name, shippingDetails.phone, shippingDetails.email, notes],
    });
    // Create order items
    for (const item of items) {
      await turso.execute({
        sql: `INSERT INTO OrderItem (id, orderId, productId, quantity, price) VALUES (?, ?, ?, ?, ?)`,
        args: [crypto.randomUUID(), orderId, item.productId, item.quantity, item.price],
      });
    }

    // Build the public site URL for PayFast return/cancel/notify URLs.
    // Priority: explicit NEXT_PUBLIC_SITE_URL → request-derived (x-forwarded-proto + host,
    // as set by Vercel) → canonical production URL. NEVER fall back to localhost — PayFast
    // must always be able to reach the notify endpoint.
    const forwardedProto = req.headers.get("x-forwarded-proto") || "https";
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (host ? `${forwardedProto}://${host}` : "https://www.ssproc.co.za");

    // ===== Bulletproof canonicalization for PayFast URLs =====
    // The apex https://ssproc.co.za (and *.vercel.app) 308-redirects to
    // https://www.ssproc.co.za. PayFast's ITN sender does NOT follow redirects,
    // so a notify_url pointing at a redirecting host silently drops the ITN and
    // the order stays "pending" forever. To guarantee the notify always lands,
    // hard-normalize notify_url to the canonical production base (no redirect).
    // return_url/cancel_url are also normalized so the customer never bounces.
    const CANONICAL_BASE = "https://www.ssproc.co.za";
    const normalizeBase = (raw: string): string => {
      // Strip trailing slash / path, keep only scheme://host
      let hostOnly = (raw || "")
        .replace(/^([a-z][a-z0-9+.-]*:\/\/)?/i, "")
        .split("/")[0]
        .split("?")[0]
        .toLowerCase();
      if (!hostOnly) return CANONICAL_BASE;
      // Force https, and if this is our own domain (apex or www) or a vercel
      // preview host, pin the canonical www host so notify never redirects.
      if (hostOnly === "ssproc.co.za" || hostOnly === "www.ssproc.co.za" || hostOnly.endsWith(".vercel.app")) {
        return CANONICAL_BASE;
      }
      return `https://${hostOnly}`;
    };
    const canonicalBase = normalizeBase(siteUrl);

    // 2. Prepare PayFast payment data
    const payfastData: Record<string, string> = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID || "",
      merchant_key: process.env.PAYFAST_MERCHANT_KEY || "",
      return_url: `${canonicalBase}/checkout/success?orderId=${orderId}`,
      cancel_url: `${canonicalBase}/checkout/cancel?orderId=${orderId}`,
      notify_url: `${canonicalBase}/api/payfast/notify`,
      name_first: session.user.name?.split(" ")[0] || "Customer",
      name_last: session.user.name?.split(" ")[1] || "",
      email_address: session.user.email || "",
      m_payment_id: orderId,
      amount: grandTotal.toFixed(2),
      item_name: `Order ${orderNumber}`,
    };

    // 3. Generate signature
    if (!process.env.PAYFAST_MERCHANT_ID || !process.env.PAYFAST_MERCHANT_KEY) {
      return NextResponse.json(
        { error: "Payment gateway not configured. Please set PAYFAST_MERCHANT_ID and PAYFAST_MERCHANT_KEY." },
        { status: 500 }
      );
    }
    const passphrase = process.env.PAYFAST_PASSPHRASE || ""
    const signature = generatePayFastSignature(payfastData, passphrase);
    payfastData.signature = signature;
    
    // Build debug string showing exact param string used for signature
    const debugKeys = Object.keys(payfastData).filter(k => k !== 'signature').sort();
    const debugParamString = debugKeys.map(k => `${k}=${encodeURIComponent(payfastData[k].trim()).replace(/%20/g, '+')}`).join('&');
    
    // Debug: log signature for troubleshooting
    console.log('[PAYFAST DEBUG] Signature:', signature);
    console.log('[PAYFAST DEBUG] Param string:', Object.keys(payfastData).filter(k => k !== 'signature').sort().map(k => `${k}=${payfastData[k]}`).join('&'));

    return NextResponse.json({
      orderId,
      orderNumber,
      payfastUrl: PAYFAST_URL,
      payfastData,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
