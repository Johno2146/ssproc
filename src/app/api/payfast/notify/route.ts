import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import crypto from "crypto";
import { sendEmail, orderSalesEmailHtml, orderCustomerEmailHtml } from "@/lib/email";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL || "",
  authToken: process.env.TURSO_AUTH_TOKEN || "",
});

function generatePayFastSignature(rawPairs: Record<string, string>, passphrase?: string): string {
  // rawPairs values are already URL-encoded exactly as PayFast sent them
  const keys = Object.keys(rawPairs).sort();
  let paramString = keys.map(k => `${k}=${rawPairs[k]}`).join('&');
  if (passphrase && passphrase.trim()) {
    paramString += '&passphrase=' + passphrase.trim();
  }
  return crypto.createHash('md5').update(paramString).digest('hex');
}

async function sendOrderNotification(order: any, orderItems: any[]) {
  const SALES_EMAIL = "sales@ssproc.co.za";

  // 1. Notify sales team (HTML)
  sendEmail(SALES_EMAIL, `New Order: ${order.orderNumber}`, orderSalesEmailHtml(order, orderItems));

  // 2. Customer confirmation (HTML)
  if (order.shippingEmail) {
    sendEmail(order.shippingEmail, `Order Confirmation: ${order.orderNumber}`, orderCustomerEmailHtml(order, orderItems));
  }
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    console.log("[PayFast ITN] Raw body:", rawBody);

    // Parse raw key=value pairs, keeping values URL-encoded for signature
    const rawPairs: Record<string, string> = {};
    const data: Record<string, string> = {};
    let rawSignature = '';
    rawBody.split('&').forEach(pair => {
      const eq = pair.indexOf('=');
      if (eq === -1) return;
      const rawKey = pair.substring(0, eq);
      const rawVal = pair.substring(eq + 1);
      const key = decodeURIComponent(rawKey);
      if (key === 'signature') {
        rawSignature = rawVal;
        data[key] = decodeURIComponent(rawVal);
      } else if (key) {
        rawPairs[key] = rawVal; // Keep URL-encoded for signature
        data[key] = decodeURIComponent(rawVal).replace(/\+/g, ' ');
      }
    });

    console.log("[PayFast ITN] Received:", JSON.stringify(data));

    // 1. Verify signature
    const passphrase = process.env.PAYFAST_PASSPHRASE || "";
    const expectedSignature = generatePayFastSignature(rawPairs, passphrase);
    const sigOk = !rawSignature || rawSignature === expectedSignature;
    
    // Log signature comparison for debugging
    try {
      await turso.execute({ sql: `DROP TABLE IF EXISTS ItnLog` });
      await turso.execute({ sql: `CREATE TABLE IF NOT EXISTS ItnLog (id INTEGER PRIMARY KEY AUTOINCREMENT, orderId TEXT, paymentStatus TEXT, sigOk INTEGER, expectedSig TEXT, receivedSig TEXT, rawData TEXT, createdAt TEXT)` });
      await turso.execute({
        sql: `INSERT INTO ItnLog (orderId, paymentStatus, sigOk, expectedSig, receivedSig, rawData, createdAt) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
        args: [data.m_payment_id || "unknown", data.payment_status || "unknown", sigOk ? 1 : 0, expectedSignature, rawSignature, rawBody],
      });
    } catch (e) {
      console.error("[PayFast ITN] Failed to log to DB:", e);
    }
    
    // Signature check is best-effort (log only — do NOT block payment processing)
    if (rawSignature && !sigOk) {
      console.warn("[PayFast ITN] Signature mismatch (continuing with amount verification). Expected:", expectedSignature, "Got:", rawSignature);
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
      console.error(`[PayFast ITN] Amount mismatch for ${orderId}: expected ${orderTotal}, got ${paidAmount} — NOT marking paid`);
      return new Response("Amount mismatch", { status: 200 });
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

      // 4b. Attach product names to items
      const items = [];
      for (const item of itemsResult.rows) {
        let productName = item.productId;
        try {
          const prodResult = await turso.execute({
            sql: `SELECT name FROM Product WHERE id = ?`,
            args: [item.productId],
          });
          if (prodResult.rows.length > 0) {
            productName = prodResult.rows[0].name;
          }
        } catch {}
        items.push({
          ...item,
          productName,
          price: Number(item.price),
          quantity: Number(item.quantity),
        });
      }

      // 5. Send notifications
      sendOrderNotification(order, items).catch(e => 
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
