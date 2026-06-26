import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const data = Object.fromEntries(formData.entries());

    // 1. Verify the notification (Stub)
    // In a real implementation, you would verify the signature and the merchant ID
    console.log("Received PayFast notification:", data);

    const orderId = data.m_payment_id as string;
    const paymentStatus = data.payment_status as string;

    if (paymentStatus === "COMPLETE") {
      // 2. Update order status
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "paid",
          paidAt: new Date(),
          payfastId: data.pf_payment_id as string,
        },
      });

      // 3. Create tracking entry
      await prisma.tracking.create({
        data: {
          orderId,
          status: "paid",
          message: "Payment successfully processed via PayFast",
        },
      });
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("PayFast notification error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
