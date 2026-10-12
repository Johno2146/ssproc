import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";
import crypto from "crypto";
import { sendEmail, orderSalesEmailHtml, orderCustomerEmailHtml } from "@/lib/email";
import {
  isCompletedState,
  StitchError,
  verifyStitchWebhookSignature,
  extractPaymentRequestNode,
  STITCH_STATE_CANCELLED,
  STITCH_STATE_EXPIRED,
} from "@/lib/stitch";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL || "",
  authToken: process.env.TURSO_AUTH_TOKEN || "",
});

async function sendOrderNotification(order: any, orderItems: any[]) {
  const SALES_EMAIL = "sales@ssproc.co.za";
  // 1. Notify sales team (HTML)
  sendEmail(SALES_EMAIL, `New Order: ${order.orderNumber}`, orderSalesEmailHtml(order, orderItems));
  // 2. Customer confirmation (HTML)
  if (order.shippingEmail) {
    sendEmail(order.shippingEmail, `Order Confirmation: ${order.orderNumber}`, orderCustomerEmailHtml(order, orderItems));
  }
}

/**
 * Stitch webhook endpoint (Svix-delivered, signature-verified). This is the
 * SOURCE OF TRUTH for payment completion — the return-redirect query string
 * is never trusted for database writes (anyone can fabricate `?status=complete`).
 *
 * Subscription: the owner configures this URL + event type "payment" per
 * Stitch client (via the Svix portal or Stitch API), and saves the Svix
 * signing secret as STITCH_WEBHOOK_SECRET.
 *
 * Behaviour:
 *  - signature-verify every payload; 400 on failure (Svix will retry)
 *  - on PaymentInitiationRequestCompleted: mark the order paid (pending→paid,
 *    amount-checked, idempotent) + send order emails (mirrors PayFast ITN)
 *  - on Cancelled/Expired/Pending: leave the order pending, log only
 *  - always returns 200 for processed events (Svix retries on any non-200)
 */
export async function POST(req: Request) {
  const rawBody = await req.text();
  const headers = {
    "svix-id": req.headers.get("svix-id"),
    "svix-timestamp": req.headers.get("svix-timestamp"),
    "svix-signature": req.headers.get("svix-signature"),
  };

  // 1. Signature verification — authoritative gate.
  try {
    verifyStitchWebhookSignature(rawBody, headers);
  } catch (e: any) {
    const msg = e instanceof StitchError ? e.message : String(e?.message || e);
    console.error(`[Stitch Webhook] Signature verification failed: ${msg}`);
    return NextResponse.json({ error: msg }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch (e) {
    console.error("[Stitch Webhook] Invalid JSON body:", e);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const node = extractPaymentRequestNode(payload);
  const requestId = node?.id || "unknown";
  const externalReference = node?.externalReference || null;
  const stateTypename = node?.state?.__typename || "unknown";

  // 2. Record every verified webhook for audit (mirrors ItnLog; 14-day rolloff).
  try {
    await turso.execute({ sql: `CREATE TABLE IF NOT EXISTS StitchWebhookLog (id INTEGER PRIMARY KEY AUTOINCREMENT, paymentRequestId TEXT, externalReference TEXT, state TEXT, sigOk INTEGER DEFAULT 1, payload TEXT, processedAt TEXT)` });
    await turso.execute({ sql: `DELETE FROM StitchWebhookLog WHERE processedAt < datetime('now','-14 days')` });
    await turso.execute({
      sql: `INSERT INTO StitchWebhookLog (paymentRequestId, externalReference, state, sigOk, payload, processedAt) VALUES (?, ?, ?, 1, ?, datetime('now'))`,
      args: [requestId, externalReference || "", stateTypename, rawBody],
    });
  } catch (e) {
    console.error("[Stitch Webhook] Failed to log to DB:", e);
  }

  console.log(`[Stitch Webhook] Verified event state=${stateTypename} request=${requestId} externalReference=${externalReference}`);

  if (!node || !externalReference) {
    // No order correlation data — nothing to action. Acknowledge.
    console.warn("[Stitch Webhook] Payload has no node/externalReference — ignoring.");
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // 3. Locate the order: externalReference is our order number (SS-xxxx);
  //    metadata.orderId is a fallback.
  let order: any = null;
  try {
    const byRef = await turso.execute({
      sql: `SELECT * FROM "Order" WHERE orderNumber = ? LIMIT 1`,
      args: [externalReference],
    });
    if (byRef.rows.length > 0) {
      order = byRef.rows[0];
    } else {
      const orderIdFromMeta = node?.metadata?.orderId;
      if (orderIdFromMeta) {
        const byId = await turso.execute({
          sql: `SELECT * FROM "Order" WHERE id = ? LIMIT 1`,
          args: [String(orderIdFromMeta)],
        });
        order = byId.rows[0] || null;
      }
    }
  } catch (e) {
    console.error("[Stitch Webhook] Order lookup error:", e);
  }

  if (!order) {
    console.error(`[Stitch Webhook] Order not found for externalReference=${externalReference} — NOT marking paid`);
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // 4. Amount check (advisory-source-of-truth): Stitch quantity is ZAR decimal.
  const paidAmount = parseFloat(node?.amount?.quantity || "0");
  const orderTotal = Number(order.total) || 0;
  if (isCompletedState(node) && Math.abs(paidAmount - orderTotal) > 0.01) {
    console.error(`[Stitch Webhook] Amount mismatch for ${order.orderNumber}: expected ${orderTotal}, got ${paidAmount} — NOT marking paid`);
    return NextResponse.json({ ok: true, note: "amount-mismatch" }, { status: 200 });
  }

  // 5. Mark paid only on the Completed terminal state, and only from pending
  //    (idempotent — duplicate webhooks must not re-email or double-process).
  if (isCompletedState(node)) {
    if (order.status === "paid") {
      console.log(`[Stitch Webhook] Order ${order.orderNumber} already paid — skipping duplicate`);
      return NextResponse.json({ ok: true, note: "already-paid" }, { status: 200 });
    }
    if (order.status !== "pending") {
      console.warn(`[Stitch Webhook] Order ${order.orderNumber} status is "${order.status}" (not pending) — not auto-marking paid`);
      return NextResponse.json({ ok: true, note: "non-pending" }, { status: 200 });
    }
    try {
      await turso.execute({
        sql: `UPDATE "Order" SET status = 'paid', paidAt = ?, updatedAt = datetime('now'), notes = COALESCE(notes || ' | ', '') || ? WHERE id = ?`,
        args: [new Date().toISOString(), `Paid via Stitch (request ${requestId})`, order.id],
      });
      console.log(`[Stitch Webhook] ✓ Order ${order.orderNumber} marked as paid (Stitch request ${requestId})`);

      // Send order emails (fire-and-forget, same as PayFast ITN)
      try {
        const itemsRes = await turso.execute({ sql: `SELECT * FROM OrderItem WHERE orderId = ?`, args: [order.id] });
        const items = itemsRes.rows;
        order.status = "paid";
        sendOrderNotification(order, items).catch((e) => console.error("[Stitch Webhook] Notification email failed:", e));
      } catch (e) {
        console.error("[Stitch Webhook] Failed to fetch order items for notification:", e);
      }
    } catch (e) {
      console.error("[Stitch Webhook] Failed to mark order paid:", e);
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }
  } else {
    const reason = stateTypename === STITCH_STATE_CANCELLED ? "cancelled"
      : stateTypename === STITCH_STATE_EXPIRED ? "expired" : "non-terminal";
    console.log(`[Stitch Webhook] Order ${order.orderNumber} payment ${reason} — order stays pending (status=${order.status})`);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}