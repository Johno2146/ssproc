import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { items, shippingName, shippingPhone, shippingEmail, notes } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    // Calculate total from product prices (in production, query DB for accurate prices)
    let total = 0;
    for (const item of items) {
      // In production, validate price against DB product
      total += item.price * item.quantity;
    }

    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderNumber: `SSP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        userId: (session.user as any).id,
        status: "pending",
        total,
        shippingName: shippingName || "",
        shippingPhone: shippingPhone || "",
        shippingEmail: shippingEmail || "",
        notes: notes || "",
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: true },
    });

    // Return PayFast redirect URL (sandbox)
    const payfastUrl = process.env.PAYFAST_SANDBOX === "true"
      ? "https://sandbox.payfast.co.za/eng/process"
      : "https://www.payfast.co.za/eng/process";

    // PayFast merchant configuration
    const pfData = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID || "",
      merchant_key: process.env.PAYFAST_MERCHANT_KEY || "",
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/orders/${order.id}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/orders/${order.id}/cancel`,
      notify_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payfast/notify`,
      name_first: shippingName?.split(" ")[0] || "Customer",
      name_last: shippingName?.split(" ").slice(1).join(" ") || "",
      email_address: shippingEmail || session.user.email || "",
      m_payment_id: order.orderNumber,
      amount: total.toFixed(2),
      item_name: `Order ${order.orderNumber}`,
      item_description: `${items.length} item(s)`,
    };

    return NextResponse.json({
      success: true,
      order,
      payfastUrl,
      payfastData: pfData,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}