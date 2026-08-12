import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";

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
    `  - ${item.productName || item.productId}: ${item.quantity} × R${Number(item.price).toFixed(2)} = R${(item.quantity * Number(item.price)).toFixed(2)}`
  ).join('\n');

  const orderTotal = Number(order.total).toFixed(2);

  // 1. Notify sales team
  const salesBody = `NEW ORDER RECEIVED
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

ORDER TOTAL: R${orderTotal} (incl. VAT)
Payment Status: PAID`;

  sendEmail(SALES_EMAIL, `New Order: ${order.orderNumber}`, salesBody);

  // 2. Customer confirmation
  if (order.shippingEmail) {
    const customerBody = `Dear ${order.shippingName},

Thank you for your order with Sealed & Secured!

ORDER CONFIRMATION
==================
Order Number: ${order.orderNumber}

${itemsList}

TOTAL: R${orderTotal} (incl. VAT)

We'll notify you when your order is ready for dispatch.

Regards,
Sealed & Secured Team
www.ssproc.co.za`;

    sendEmail(order.shippingEmail, `Order Confirmation: ${order.orderNumber}`, customerBody);
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
    const sigOk = !data.signature || data.signature === expectedSignature;
    
    // Log signature comparison for debugging
    try {
      await turso.execute({ sql: `CREATE TABLE IF NOT EXISTS ItnLog (id INTEGER PRIMARY KEY AUTOINCREMENT, orderId TEXT, paymentStatus TEXT, sigOk INTEGER, expectedSig TEXT, receivedSig TEXT, rawData TEXT, createdAt TEXT)` });
      await turso.execute({
        sql: `INSERT INTO ItnLog (orderId, paymentStatus, sigOk, expectedSig, receivedSig, rawData, createdAt) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
        args: [data.m_payment_id || "unknown", data.payment_status || "unknown", sigOk ? 1 : 0, expectedSignature, data.signature || "", JSON.stringify(data)],
      });
    } catch (e) {
      console.error("[PayFast ITN] Failed to log to DB:", e);
    }
    
    if (data.signature && !sigOk) {
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
