import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function generatePayFastSignature(data: Record<string, string>, passphrase?: string): string {
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

async function sendOrderNotification(order: any, orderItems: any[]) {
  const SALES_EMAIL = "sales@ssproc.co.za";
  
  // Build items list
  const itemsList = orderItems.map((item: any) => 
    `  - ${item.product?.name || item.productId}: ${item.quantity} × R${item.price.toFixed(2)} = R${(item.quantity * item.price).toFixed(2)}`
  ).join('\n');

  const emailBody = `
NEW ORDER RECEIVED
==================
Order Number: ${order.orderNumber}
Date: ${new Date().toLocaleString('en-ZA')}

CUSTOMER DETAILS
----------------
Name: ${order.shippingName}
Email: ${order.shippingEmail}
Phone: ${order.shippingPhone}
${order.companyName ? `Company: ${order.companyName}` : ''}
${order.vatNumber ? `VAT: ${order.vatNumber}` : ''}

DELIVERY ADDRESS
----------------
${order.deliveryAddress || 'Collection from Springs (1559)'}

${order.billingAddress ? `BILLING ADDRESS\n----------------\n${order.billingAddress}\n` : ''}
ORDER ITEMS
-----------
${itemsList}

ORDER TOTAL: R${order.total.toFixed(2)} (incl. VAT)
Payment Status: ${order.status}
  `.trim();

  // Send to sales
  try {
    await sendEmail(SALES_EMAIL, `New Order: ${order.orderNumber}`, emailBody);
  } catch (e) {
    console.log("Failed to send sales notification email:", e);
  }

  // Send confirmation to customer
  if (order.shippingEmail) {
    const customerBody = `
Dear ${order.shippingName},

Thank you for your order with Sealed & Secured!

ORDER CONFIRMATION
==================
Order Number: ${order.orderNumber}

${itemsList}

TOTAL: R${order.total.toFixed(2)} (incl. VAT)

${order.deliveryAddress ? `Delivery to: ${order.deliveryAddress}` : 'Your order will be available for collection from Eastwood Business Park, Springs (1559).'}

We'll notify you when your order is ready.

Regards,
Sealed & Secured Team
www.ssproc.co.za
    `.trim();

    try {
      await sendEmail(order.shippingEmail, `Order Confirmation: ${order.orderNumber}`, customerBody);
    } catch (e) {
      console.log("Failed to send customer confirmation email:", e);
    }
  }
}

async function sendEmail(to: string, subject: string, body: string) {
  // Try nodemailer if configured
  if (process.env.SMTP_HOST) {
    try {
      const nodemailer = require("nodemailer");
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      await transporter.sendMail({
        from: process.env.SMTP_FROM || "orders@ssproc.co.za",
        to,
        subject,
        text: body,
      });
      console.log(`Email sent to ${to}: ${subject}`);
      return;
    } catch (e) {
      console.error("SMTP error, falling back to console log:", e);
    }
  }
  
  // Fallback: log to console and try to send via contact form endpoint
  console.log(`[EMAIL TO: ${to}] ${subject}`);
  console.log(body);
  
  // Try sending via the contact form API
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    await fetch(`${siteUrl}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Order System",
        email: to,
        message: body,
        subject: subject,
      }),
    });
  } catch (e) {
    console.log("Contact form fallback also failed:", e);
  }
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
      return new Response("Invalid signature", { status: 200 });
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

      // 5. Send order notifications
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId },
        include: { product: true },
      });
      sendOrderNotification(order, orderItems).catch(e => 
        console.error("Failed to send order notifications:", e)
      );

      console.log(`✓ Order ${orderId} marked as paid`);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("PayFast notification error:", error);
    return new Response("OK", { status: 200 });
  }
}
