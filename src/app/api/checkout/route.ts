import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const PAYFAST_URL = process.env.PAYFAST_SANDBOX === "true"
  ? "https://sandbox.payfast.co.za/eng/process"
  : "https://www.payfast.co.za/eng/process";

function generatePayFastSignature(data: Record<string, string>, passphrase?: string): string {
  // Sort by key, create param string
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
    const { items, shippingDetails } = body;

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

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: (session.user as any).id,
        total: grandTotal,
        shippingName: shippingDetails.name,
        shippingPhone: shippingDetails.phone,
        shippingEmail: shippingDetails.email,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    
    // 2. Prepare PayFast payment data
    const payfastData: Record<string, string> = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID || "10000100",
      merchant_key: process.env.PAYFAST_MERCHANT_KEY || "46f0cd694581a",
      return_url: `${siteUrl}/checkout/success?orderId=${order.id}`,
      cancel_url: `${siteUrl}/checkout/cancel?orderId=${order.id}`,
      notify_url: `${siteUrl}/api/payfast/notify`,
      name_first: session.user.name?.split(" ")[0] || "Customer",
      name_last: session.user.name?.split(" ")[1] || "",
      email_address: session.user.email || "",
      m_payment_id: order.id,
      amount: grandTotal.toFixed(2),
      item_name: `Order ${orderNumber}`,
    };

    // 3. Generate signature
    const passphrase = process.env.PAYFAST_PASSPHRASE || "";
    const signature = generatePayFastSignature(payfastData, passphrase);
    payfastData.signature = signature;

    return NextResponse.json({
      orderId: order.id,
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
