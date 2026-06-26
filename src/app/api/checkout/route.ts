import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { items, shippingDetails } = body;

    // 1. Create order in database
    const orderNumber = `SS-${Date.now()}`;
    const total = items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: (session.user as any).id,
        total,
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

    // 2. Prepare PayFast payment data (Stub)
    // In a real implementation, you would generate a signature and return the PayFast URL
    const payfastData = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID || "10000100",
      merchant_key: process.env.PAYFAST_MERCHANT_KEY || "46f0cd694581a",
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${order.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel?orderId=${order.id}`,
      notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payfast/notify`,
      name_first: session.user.name?.split(" ")[0] || "",
      name_last: session.user.name?.split(" ")[1] || "",
      email_address: session.user.email || "",
      m_payment_id: order.id,
      amount: total.toFixed(2),
      item_name: `Order ${orderNumber}`,
    };

    // For now, we'll return a stub URL
    const payfastUrl = "https://sandbox.payfast.co.za/eng/process";

    return NextResponse.json({
      orderId: order.id,
      payfastUrl,
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
