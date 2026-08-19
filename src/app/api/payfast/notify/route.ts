import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import crypto from "crypto";
import { sendEmail, orderSalesEmailHtml, orderCustomerEmailHtml } from "@/lib/email";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL || "",
  authToken: process.env.TURSO_AUTH_TOKEN || "",
});

// PayFast ITN validation endpoint (curl-back). Live unless PAYFAST_SANDBOX === "true".
const PAYFAST_VALIDATE_URL = process.env.PAYFAST_SANDBOX === "true"
  ? "https://sandbox.payfast.co.za/eng/query/validate"
  : "https://www.payfast.co.za/eng/query/validate";

function md5(s: string): string {
  return crypto.createHash("md5").update(s).digest("hex");
}

/**
 * Compute candidate MD5 signatures for an ITN.
 * PayFast signs the body in the order it was sent (empirically verified 2026-08-19:
 * the Aug 13 SS-1000 ITN matched md5(unsorted raw pairs, NO passphrase)). Some
 * integrations sort the parameters, and some accounts configure a passphrase.
 * We accept any of the 4 combinations as a match; the check is ADVISORY only —
 * the authoritative gate is the PayFast curl-back validation (response "VALID").
 */
function generateSignatureCandidates(rawPairs: Record<string, string>, passphrase: string) {
  const unsorted = Object.keys(rawPairs).map(k => `${k}=${rawPairs[k]}`).join("&");
  const sorted = Object.keys(rawPairs).sort().map(k => `${k}=${rawPairs[k]}`).join("&");
  const pp = passphrase && passphrase.trim() ? passphrase.trim() : null;
  return {
    unsortedNoPp: md5(unsorted),
    sortedNoPp: md5(sorted),
    unsortedPp: pp ? md5(unsorted + "&passphrase=" + pp) : null,
    sortedPp: pp ? md5(sorted + "&passphrase=" + pp) : null,
  };
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

    // 1. Advisory local signature check (accepts sorted/unsorted x with/without passphrase).
    //    NOT blocking: PayFast curl-back validation below is authoritative.
    const passphrase = process.env.PAYFAST_PASSPHRASE || "";
    const candidates = generateSignatureCandidates(rawPairs, passphrase);
    const sigOk = !rawSignature || Object.values(candidates).filter(Boolean).includes(rawSignature);
    const expectedSigJson = JSON.stringify(candidates);

    if (rawSignature && !sigOk) {
      console.warn("[PayFast ITN] Signature mismatch (advisory). Candidates:", expectedSigJson, "Got:", rawSignature);
    } else if (rawSignature) {
      console.log("[PayFast ITN] Signature OK (matched one of the 4 candidate hashes)");
    }

    // Log signature comparison for debugging.
    // NOTE: never DROP the ItnLog table (it wipes the audit trail for every stuck order).
    // Create if missing (with the validation column), add the column to pre-existing
    // tables via ALTER (idempotent), then roll off rows older than 14 days once per ITN.
    let logId: number | null = null;
    try {
      await turso.execute({ sql: `CREATE TABLE IF NOT EXISTS ItnLog (id INTEGER PRIMARY KEY AUTOINCREMENT, orderId TEXT, paymentStatus TEXT, sigOk INTEGER, expectedSig TEXT, receivedSig TEXT, rawData TEXT, validation TEXT, createdAt TEXT)` });
      try {
        await turso.execute({ sql: `ALTER TABLE ItnLog ADD COLUMN validation TEXT` });
      } catch { /* column already exists */ }
      await turso.execute({ sql: `DELETE FROM ItnLog WHERE createdAt < datetime('now','-14 days')` });
      const ins = await turso.execute({
        sql: `INSERT INTO ItnLog (orderId, paymentStatus, sigOk, expectedSig, receivedSig, rawData, validation, createdAt) VALUES (?, ?, ?, ?, ?, ?, '', datetime('now'))`,
        args: [data.m_payment_id || "unknown", data.payment_status || "unknown", sigOk ? 1 : 0, expectedSigJson, rawSignature, rawBody],
      });
      logId = Number(ins.lastInsertRowid);
    } catch (e) {
      console.error("[PayFast ITN] Failed to log to DB:", e);
    }

    const orderId = data.m_payment_id as string;
    const paymentStatus = data.payment_status as string;

    if (!orderId) {
      console.error("[PayFast ITN] No order ID in ITN body");
      return new Response("Missing order ID", { status: 200 });
    }

    // 2. Find order in Turso
    const orderResult = await turso.execute({
      sql: `SELECT * FROM "Order" WHERE id = ?`,
      args: [orderId],
    });

    if (orderResult.rows.length === 0) {
      console.error(`[PayFast ITN] Order not found: ${orderId} — NOT marking paid`);
      return new Response("Order not found", { status: 200 });
    }

    const order = orderResult.rows[0];
    const paidAmount = parseFloat(data.amount_gross || "0");
    const orderTotal = Number(order.total);

    if (Math.abs(paidAmount - orderTotal) > 0.01) {
      console.error(`[PayFast ITN] Amount mismatch for ${orderId}: expected ${orderTotal}, got ${paidAmount} — NOT marking paid`);
      return new Response("Amount mismatch", { status: 200 });
    }

    if (paymentStatus !== "COMPLETE") {
      console.warn(`[PayFast ITN] payment_status "${paymentStatus}" for order ${orderId} is NOT COMPLETE — NOT marking order paid (order stays ${order.status})`);
      return new Response("OK", { status: 200 });
    }

    // 3. Curl-back validation with PayFast (authoritative) — only mark paid when VALID.
    let validationResult = "";
    try {
      const vres = await fetch(PAYFAST_VALIDATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: rawBody,
      });
      validationResult = (await vres.text()).trim();
      console.log(`[PayFast ITN] Curl-back validation for ${orderId}: HTTP ${vres.status}, body="${validationResult}"`);
    } catch (e) {
      console.error(`[PayFast ITN] Curl-back validation ERROR for ${orderId}: ${e} — NOT marking paid (fail closed)`);
      if (logId) {
        try { await turso.execute({ sql: `UPDATE ItnLog SET validation = ? WHERE id = ?`, args: [`ERROR: ${e}`, logId] }); } catch {}
      }
      return new Response("OK", { status: 200 });
    }

    if (logId) {
      try { await turso.execute({ sql: `UPDATE ItnLog SET validation = ? WHERE id = ?`, args: [validationResult, logId] }); } catch {}
    }

    if (validationResult !== "VALID") {
      console.warn(`[PayFast ITN] Curl-back validation FAILED for ${orderId}: response "${validationResult}" — NOT marking order paid (order stays ${order.status})`);
      return new Response("OK", { status: 200 });
    }

    // 4. Update order status in Turso (only reached when payment COMPLETE + amount ok + VALID)
    await turso.execute({
      sql: `UPDATE "Order" SET status = 'paid', paidAt = ?, updatedAt = datetime('now') WHERE id = ?`,
      args: [new Date().toISOString(), orderId],
    });

    // 5. Get order items
    const itemsResult = await turso.execute({
      sql: `SELECT * FROM OrderItem WHERE orderId = ?`,
      args: [orderId],
    });

    // 5b. Attach product names to items
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

    // 6. Send notifications
    sendOrderNotification(order, items).catch(e =>
      console.error("[PayFast ITN] Notification error:", e)
    );

    console.log(`[PayFast ITN] ✓ Order ${orderId} marked as paid (signature ${sigOk ? "matched" : "advisory-mismatch"}, curl-back VALID)`);
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[PayFast ITN] Error:", error);
    return new Response("OK", { status: 200 });
  }
}
