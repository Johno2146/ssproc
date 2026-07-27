import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import crypto from "crypto";

import { createClient } from "@libsql/client";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL || "",
  authToken: process.env.TURSO_AUTH_TOKEN || "",
});

const PAYFAST_URL = process.env.PAYFAST_SANDBOX === "true"
  ? "https://sandbox.payfast.co.za/eng/process"
  : "https://www.payfast.co.za/eng/process";

function generatePayFastSignature(data: Record<string, string>, passphrase?: string): string {
  const keys = Object.keys(data).sort();
  const paramString = keys
    .map(key => `${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, "+")}`)
    .join("&");
  
  const signatureString = passphrase 
    ? `${paramString}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`
    : paramString;
  
  return crypto.createHash("md5").update(signatureString).digest("hex");
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

    // 1. Create order in database
    const orderNumber = `SS-${Date.now()}`;
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
      sql: "INSERT INTO "Order" (id, orderNumber, userId, status, total, shippingName, shippingPhone, shippingEmail, notes, createdAt, updatedAt) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, datetime('now'), datetime('now'))",
      args: [orderId, orderNumber, (session.user as any).id, grandTotal, shippingDetails.name, shippingDetails.phone, shippingDetails.email, notes],
    });
    // Create order items
    for (const item of items) {
      await turso.execute({
        sql: `INSERT INTO OrderItem (id, orderId, productId, quantity, price) VALUES (?, ?, ?, ?, ?)`,
        args: [crypto.randomUUID(), orderId, item.productId, item.quantity, item.price],
      });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    
    // 2. Prepare PayFast payment data
    const payfastData: Record<string, string> = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID || "10000100",
      merchant_key: process.env.PAYFAST_MERCHANT_KEY || "46f0cd694581a",
      return_url: `${siteUrl}/checkout/success?orderId=${orderId}`,
      cancel_url: `${siteUrl}/checkout/cancel?orderId=${orderId}`,
      notify_url: `${siteUrl}/api/payfast/notify`,
      name_first: session.user.name?.split(" ")[0] || "Customer",
      name_last: session.user.name?.split(" ")[1] || "",
      email_address: session.user.email || "",
      m_payment_id: orderId,
      amount: grandTotal.toFixed(2),
      item_name: `Order ${orderNumber}`,
    };

    // 3. Generate signature
    const passphrase = process.env.PAYFAST_PASSPHRASE || "";
    const signature = generatePayFastSignature(payfastData, passphrase);
    payfastData.signature = signature;

    return NextResponse.json({
      orderId: orderId,
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
