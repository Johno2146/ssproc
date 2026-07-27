import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import crypto from "crypto";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL || "",
  authToken: process.env.TURSO_AUTH_TOKEN || "",
});

function generatePayFastSignature(data: Record<string, string>, passphrase?: string): string {
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

async function sendOrderNotification(order: any, orderItems: any[]) {
  const SALES_EMAIL = "sales@ssproc.co.za";
  
  const itemsList = orderItems.map((item: any) => 
    `  - ${item.productName || item.productId}: ${item.quantity} × R${item.price.toFixed(2)} = R${(item.quantity * item.price).toFixed(2)}`
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

ORDER ITEMS
-----------
${itemsList}

ORDER TOTAL: R${order.total.toFixed(2)} (incl. VAT)
Payment Status: PAID
  `.trim();

  // Send to sales — log to console (SMTP not configured on Vercel)
  console.log(`[SALES NOTIFICATION] To: ${SALES_EMAIL}`);
  console.log(emailBody);

  // Also try contact form fallback
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    await fetch(`${siteUrl}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Order System",
        email: SALES_EMAIL,
        subject: `New Order: ${order.orderNumber}`,
        message: emailBody,
      }),
    });
  } catch (e) {
    console.log("Contact form notification failed:", e);
  }

  // Customer confirmation
  if (order.shippingEmail) {
    const customerBody = `
Dear ${order.shippingName},

Thank you for your order with Sealed & Secured!

ORDER CONFIRMATION
==================
Order Number: ${order.orderNumber}

${itemsList}

TOTAL: R${order.total.toFixed(2)} (incl. VAT)

We'll notify you when your order is ready for dispatch.

Regards,
Sealed & Secured Team
www.ssproc.co.za
    `.trim();

    console.log(`[CUSTOMER EMAIL] To: ${order.shippingEmail}`);
    console.log(customerBody);
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    console.log("[PayFast ITN] Received:", JSON.stringify(data));

    // 1. Verify signature
    const passphrase = process.env.PAYFAST_PASSPHRASE || "";
    const expectedSignature = generatePayFastSignature(data, passphrase);
    
    if (data.signature && data.signature !== expectedSignature) {
      console.error("[PayFast ITN] Signature mismatch. Expected:", expectedSignature, "Got:", data.signature);
      return new Response("Invalid signature", { status: 200 });
    }

    const orderId = data.m_payment_id as string;
    const paymentStatus = data.payment_status as string;

    if (!orderId) {
      console.error("[PayFast ITN] No order ID");
      return new Response("Missing order ID", { status: 200 });
    }

    // 2. Find order in Turso
    const orderResult = await turso.execute({
      sql: `SELECT * FROM "Order" WHERE id = ?`,
      args: [orderId],
    });
    
    if (orderResult.rows.length === 0) {
      console.error(`[PayFast ITN] Order not found: ${orderId}`);
      return new Response("Order not found", { status: 200 });
    }

    const order = orderResult.rows[0];
    const paidAmount = parseFloat(data.amount_gross || "0");
    const orderTotal = Number(order.total);

    if (Math.abs(paidAmount - orderTotal) > 0.01) {
      console.error(`[PayFast ITN] Amount mismatch for ${orderId}: expected ${orderTotal}, got ${paidAmount}`);
    }

    if (paymentStatus === "COMPLETE") {
      // 3. Update order status in Turso
      await turso.execute({
        sql: `UPDATE "Order" SET status = 'paid', paidAt = ?, updatedAt = datetime('now') WHERE id = ?`,
        args: [new Date().toISOString(), orderId],
      });

      // 4. Get order items
      const itemsResult = await turso.execute({
        sql: `SELECT * FROM OrderItem WHERE orderId = ?`,
        args: [orderId],
      });

      // 5. Send notifications
      sendOrderNotification(order, itemsResult.rows).catch(e => 
        console.error("[PayFast ITN] Notification error:", e)
      );

      console.log(`[PayFast ITN] ✓ Order ${orderId} marked as paid`);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[PayFast ITN] Error:", error);
    return new Response("OK", { status: 200 });
  }
}
