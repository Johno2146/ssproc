import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function generatePayFastSignature(data: Record<string, string>, passphrase?: string): string {
  // Remove signature from the data for verification
  const { signature, ...rest } = data;
  const keys = Object.keys(rest).sort();
  const paramString = keys
    .map(key => `${key}=${encodeURIComponent(rest[key].trim()).replace(/%20/g, "+")}`)
    .join("&");
  
  const signatureString = passphrase 
    ? `${paramString}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`
    : paramString;
  
  return crypto.createHash("md5").update(signatureString).digest("hex");
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    console.log("Received PayFast notification:", data);

    // 1. Verify the notification signature
    const passphrase = process.env.PAYFAST_PASSPHRASE || "";
    const expectedSignature = generatePayFastSignature(data, passphrase);
    
    if (data.signature && data.signature !== expectedSignature) {
      console.error("PayFast signature mismatch");
      return new Response("Invalid signature", { status: 200 }); // Return 200 to acknowledge
    }

    const orderId = data.m_payment_id as string;
    const paymentStatus = data.payment_status as string;

    if (!orderId) {
      console.error("No order ID in PayFast notification");
      return new Response("Missing order ID", { status: 200 });
    }

    // 2. Verify the payment amount matches the order
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      console.error(`Order not found: ${orderId}`);
      return new Response("Order not found", { status: 200 });
    }

    const paidAmount = parseFloat(data.amount_gross || "0");
    if (Math.abs(paidAmount - order.total) > 0.01) {
      console.error(`Amount mismatch for order ${orderId}: expected ${order.total}, got ${paidAmount}`);
      // Still process but log the error
    }

    if (paymentStatus === "COMPLETE") {
      // 3. Update order status
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "paid",
          paidAt: new Date(),
          payfastId: data.pf_payment_id as string,
        },
      });

      // 4. Create tracking entry
      await prisma.tracking.create({
        data: {
          orderId,
          status: "paid",
          message: "Payment successfully processed via PayFast",
        },
      });

      console.log(`✓ Order ${orderId} marked as paid`);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("PayFast notification error:", error);
    return new Response("OK", { status: 200 }); // Always return 200 to acknowledge
  }
}
