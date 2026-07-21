import { NextResponse } from "next/server";

// PayFast ITN (Instant Transaction Notification) handler
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    console.log("PayFast notification received:", data);

    const paymentStatus = data["payment_status"];
    const pfPaymentId = data["pf_payment_id"];
    const mPaymentId = data["m_payment_id"];
    const amountGross = data["amount_gross"];

    // TODO: Verify signature and validate with PayFast server
    // In production, send data back to PayFast for validation

    if (paymentStatus === "COMPLETE") {
      // Payment successful - update order status
      // const order = await prisma.order.update({
      //   where: { orderNumber: mPaymentId },
      //   data: {
      //     status: "paid",
      //     payfastId: pfPaymentId,
      //     paidAt: new Date(),
      //   },
      // });
      console.log(`Payment complete for order ${mPaymentId}: R${amountGross}`);
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("PayFast notify error:", error);
    return new NextResponse("ERROR", { status: 500 });
  }
}

// Also accept GET for debugging
export async function GET(req: Request) {
  const url = new URL(req.url);
  console.log("PayFast return:", Object.fromEntries(url.searchParams));
  return NextResponse.redirect(new URL("/dashboard", req.url));
}