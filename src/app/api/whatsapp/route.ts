import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { orderId, message } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const phoneNumber = order.shippingPhone || order.user.phone;
    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number not found for this order" },
        { status: 400 }
      );
    }

    // WhatsApp API Stub
    console.log(`Sending WhatsApp notification to ${phoneNumber}: ${message}`);

    // In a real implementation, you would use a service like Twilio or a WhatsApp Business API provider
    // const response = await fetch('https://api.whatsapp.com/...', { ... });

    // Update tracking
    await prisma.tracking.create({
      data: {
        orderId,
        status: "notification_sent",
        message: `WhatsApp notification sent: ${message}`,
      },
    });

    return NextResponse.json({ success: true, message: "WhatsApp notification sent (stub)" });
  } catch (error) {
    console.error("WhatsApp notification error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
