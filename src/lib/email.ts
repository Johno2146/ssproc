import { Resend } from 'resend';
import { withVat } from '@/lib/vat';

/**
 * Resend client. Created lazily so a key added/changed in the environment is
 * picked up without depending on module-load order.
 */
let resendClient: Resend | null | undefined;
function getResend(): Resend | null {
  if (resendClient === undefined) {
    resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  }
  return resendClient;
}

/**
 * The sender that is verified in Resend and already proven to deliver mail
 * (it is the same identity /api/outreach/send uses successfully).
 * Never change this to an address that has not been verified in Resend —
 * Resend rejects unverified senders and the mail is silently dropped.
 */
export const VERIFIED_FROM = 'Sealed and Secured <sales@ssproc.co.za>';

/** Sender actually used for app mail (OTP, order, contact notifications). */
export function getFromEmail(): string {
  return process.env.RESEND_EMAIL_FROM || VERIFIED_FROM;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ssproc.vercel.app';
const LOGO_URL = `${SITE_URL}/assets/LOGO%20WHITE%20TRANS.png`;

// Brand palette (matches site: Deep Navy + Primary Blue)
const NAVY = '#0B1F3A';
const BLUE = '#1D4ED8';
const LIGHT_BG = '#F8FAFC';

function esc(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Wraps inner content in a branded email shell (logo header + footer).
 * `content` is the inner HTML block.
 */
function brandedEmail(title: string, content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:${LIGHT_BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${LIGHT_BG};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:${NAVY};padding:24px 32px;text-align:left;">
              <img src="${LOGO_URL}" alt="Sealed &amp; Secured" style="height:64px;width:auto;display:block;">
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;color:#1F2937;">
              <h1 style="margin:0 0 16px;font-size:20px;color:${NAVY};">${esc(title)}</h1>
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:${LIGHT_BG};padding:20px 32px;text-align:center;color:#6B7280;font-size:12px;border-top:1px solid #E5E7EB;">
              Sealed &amp; Secured (Pty) Ltd · Eastwood Business Park, Springs, Gauteng<br>
              <a href="${SITE_URL}" style="color:${BLUE};text-decoration:none;">www.ssproc.co.za</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Wrap outreach plain text in the branded email shell (used by /api/outreach/send
 * when the caller provides plain text instead of pre-built HTML).
 */
export function outreachBrandedHtml(title: string, plainText: string): string {
  return brandedEmail(title, `<p style="margin:0 0 16px;white-space:pre-line;">${esc(plainText)}</p>`);
}

export interface SendEmailOptions {
  replyTo?: string;
}

export interface EmailError {
  name: string;
  message: string;
  statusCode?: number;
}

export interface EmailResult {
  ok: boolean;
  id?: string;
  /** Present when ok === false — the real reason from Resend (never a secret). */
  error?: EmailError;
  /** Sender that actually delivered the message (may differ from the primary). */
  from?: string;
  /** True when the primary sender failed and the verified sender was used. */
  usedFallbackFrom?: boolean;
}

/** Normalise anything thrown/returned by the Resend SDK into a plain object. */
function toEmailError(e: unknown): EmailError {
  const anyE = e as any;
  return {
    name: String(anyE?.name || 'Error'),
    message: String(anyE?.message || anyE?.error || e || 'unknown error'),
    ...(typeof anyE?.statusCode === 'number' ? { statusCode: anyE.statusCode } : {}),
  };
}

/** Errors that mean "this sender is not allowed", i.e. worth retrying as sales@. */
function isSenderRejection(err: EmailError): boolean {
  const m = `${err.name} ${err.message}`.toLowerCase();
  return (
    err.statusCode === 403 ||
    err.statusCode === 422 ||
    m.includes('not verified') ||
    m.includes('unverified') ||
    m.includes('domain') ||
    m.includes('from address') ||
    m.includes('sender') ||
    m.includes('validation_error')
  );
}

/**
 * Core send helper. Returns {ok, id, error} so callers that need the Resend
 * message id (e.g. /api/contact verification) can surface it, and so failures
 * are diagnosable instead of being swallowed.
 *
 * If the configured sender is rejected by Resend (e.g. RESEND_EMAIL_FROM points
 * at an address that is not verified on the account), the message is retried
 * once from VERIFIED_FROM so customer mail still goes out.
 */
export async function sendEmailWithResult(to: string, subject: string, body: string, opts?: SendEmailOptions): Promise<EmailResult> {
  // Detect if body is already HTML; if not, wrap in branded shell as plain text
  const isHtml = /<[a-z][\s\S]*>/i.test(body);
  const html = isHtml ? body : brandedEmail(subject, `<p style="margin:0 0 16px;white-space:pre-line;">${esc(body)}</p>`);
  const text = body.replace(/<[^>]+>/g, '');

  const client = getResend();
  if (!client) {
    console.error(`[EMAIL DISABLED] RESEND_API_KEY is not set — To: ${to}, Subject: ${subject}`);
    return { ok: false, error: { name: 'MissingApiKey', message: 'RESEND_API_KEY is not set in the server environment' } };
  }

  const primaryFrom = getFromEmail();

  const attempt = async (from: string): Promise<{ ok: boolean; id?: string; error?: EmailError }> => {
    try {
      const { data, error } = await client.emails.send({
        from,
        to,
        subject,
        html,
        text,
        ...(opts?.replyTo ? { replyTo: opts.replyTo } : {}),
      });
      if (error) {
        const err = toEmailError(error);
        console.error(`[EMAIL ERROR] from=${from} to=${to}: ${err.name} ${err.statusCode ?? ''} ${err.message}`);
        return { ok: false, error: err };
      }
      console.log(`[EMAIL SENT] from=${from} to=${to} id=${data?.id}`);
      return { ok: true, id: data?.id };
    } catch (e) {
      const err = toEmailError(e);
      console.error(`[EMAIL ERROR] from=${from} to=${to}: ${err.name} ${err.statusCode ?? ''} ${err.message}`);
      return { ok: false, error: err };
    }
  };

  const first = await attempt(primaryFrom);
  if (first.ok) return { ok: true, id: first.id, from: primaryFrom };

  if (primaryFrom !== VERIFIED_FROM && isSenderRejection(first.error!)) {
    console.error(`[EMAIL RETRY] primary sender rejected; retrying from ${VERIFIED_FROM}`);
    const second = await attempt(VERIFIED_FROM);
    if (second.ok) return { ok: true, id: second.id, from: VERIFIED_FROM, usedFallbackFrom: true };
    return { ok: false, error: second.error, from: VERIFIED_FROM, usedFallbackFrom: true };
  }

  return { ok: false, error: first.error, from: primaryFrom };
}

export async function sendEmail(to: string, subject: string, body: string, opts?: SendEmailOptions): Promise<boolean> {
  return (await sendEmailWithResult(to, subject, body, opts)).ok;
}

export async function sendOtpEmailWithResult(email: string, name: string, otp: string): Promise<EmailResult> {
  const content = `
    <p style="margin:0 0 16px;">Hi ${esc(name)},</p>
    <p style="margin:0 0 20px;">Your verification code for Sealed &amp; Secured is:</p>
    <div style="text-align:center;margin:0 0 20px;">
      <span style="display:inline-block;font-size:28px;font-weight:700;letter-spacing:6px;color:${NAVY};background:${LIGHT_BG};border:1px dashed ${BLUE};border-radius:8px;padding:12px 24px;">${esc(otp)}</span>
    </div>
    <p style="margin:0 0 8px;color:#6B7280;font-size:13px;">This code expires in 15 minutes.</p>
    <p style="margin:0;color:#6B7280;font-size:13px;">If you didn't create an account, please ignore this email.</p>
  `;
  return sendEmailWithResult(email, `Your verification code: ${otp}`, brandedEmail('Verify your email', content));
}

/** Boolean wrapper kept for existing callers (register / forgot-password / resend-otp). */
export async function sendOtpEmail(email: string, name: string, otp: string): Promise<boolean> {
  return (await sendOtpEmailWithResult(email, name, otp)).ok;
}

// Build an HTML order items table
function orderItemsHtml(items: any[]): string {
  const rows = items.map((item: any) => {
    const name = item.productName || item.productId || 'Item';
    const qty = Number(item.quantity);
    const price = Number(item.price);
    // Line totals shown at the owner's final prices (no VAT mark-up).
    const lineTotal = withVat(qty * price).toFixed(2);
    return `<tr>
      <td style="padding:10px 12px;border-bottom:1px solid #E5E7EB;">${esc(name)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #E5E7EB;text-align:center;">${qty}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #E5E7EB;text-align:right;">R${lineTotal}</td>
    </tr>`;
  }).join('');

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 16px;">
    <thead>
      <tr style="background:${LIGHT_BG};">
        <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6B7280;border-bottom:2px solid #E5E7EB;">Item</th>
        <th style="padding:10px 12px;text-align:center;font-size:12px;color:#6B7280;border-bottom:2px solid #E5E7EB;">Qty</th>
        <th style="padding:10px 12px;text-align:right;font-size:12px;color:#6B7280;border-bottom:2px solid #E5E7EB;">Total</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

export function orderSalesEmailHtml(order: any, orderItems: any[]): string {
  const total = Number(order.total).toFixed(2);
  const shippingLine = order.shippingCost
    ? `<p style="margin:0 0 4px;font-size:14px;color:#4B5563;">Delivery (${esc(order.shippingProvider || 'Courier')}${order.shippingService ? ': ' + esc(order.shippingService) : ''}): <strong>R${Number(order.shippingCost).toFixed(2)}</strong></p>`
    : `<p style="margin:0 0 4px;font-size:14px;color:#16A34A;"><strong>Collection</strong> (free)</p>`;
  const content = `
    <p style="margin:0 0 16px;">A new order has been placed and paid.</p>
    <div style="background:${LIGHT_BG};border-radius:8px;padding:16px;margin:0 0 16px;">
      <p style="margin:0 0 4px;"><strong>Order:</strong> ${esc(order.orderNumber)}</p>
      <p style="margin:0 0 4px;"><strong>Date:</strong> ${esc(new Date().toLocaleString('en-ZA'))}</p>
      <p style="margin:0;"><strong>Status:</strong> <span style="color:#16A34A;font-weight:600;">Paid</span></p>
    </div>
    <p style="margin:0 0 8px;font-weight:600;">Customer</p>
    <p style="margin:0 0 4px;">${esc(order.shippingName)}</p>
    <p style="margin:0 0 4px;">${esc(order.shippingEmail)}</p>
    <p style="margin:0 0 16px;">${esc(order.shippingPhone)}</p>
    <p style="margin:0 0 8px;font-weight:600;">Items</p>
    ${orderItemsHtml(orderItems)}
    <div style="text-align:right;margin:0 0 16px;">
      ${shippingLine}
      <p style="margin:0;font-size:16px;font-weight:700;color:${NAVY};">Order Total: R${total} <span style="font-weight:400;color:#6B7280;font-size:12px;">(incl. delivery)</span></p>
    </div>
  `;
  return brandedEmail('New Order Received', content);
}

export function orderCustomerEmailHtml(order: any, orderItems: any[]): string {
  const total = Number(order.total).toFixed(2);
  const shippingLine = order.shippingCost
    ? `<p style="margin:0 0 4px;font-size:14px;color:#4B5563;">Delivery (${esc(order.shippingProvider || 'Courier')}${order.shippingService ? ': ' + esc(order.shippingService) : ''}): <strong>R${Number(order.shippingCost).toFixed(2)}</strong></p>`
    : `<p style="margin:0 0 4px;font-size:14px;color:#16A34A;"><strong>Collection</strong> (free)</p>`;
  const content = `
    <p style="margin:0 0 16px;">Hi ${esc(order.shippingName)},</p>
    <p style="margin:0 0 16px;">Thank you for your order with Sealed &amp; Secured. We've received your payment and your order is confirmed.</p>
    <div style="background:${LIGHT_BG};border-radius:8px;padding:16px;margin:0 0 16px;">
      <p style="margin:0;"><strong>Order Number:</strong> ${esc(order.orderNumber)}</p>
    </div>
    <p style="margin:0 0 8px;font-weight:600;">Your Items</p>
    ${orderItemsHtml(orderItems)}
    <div style="text-align:right;margin:0 0 16px;">
      ${shippingLine}
      <p style="margin:0;font-size:16px;font-weight:700;color:${NAVY};">Total: R${total} <span style="font-weight:400;color:#6B7280;font-size:12px;">(incl. delivery)</span></p>
    </div>
    <p style="margin:0 0 8px;color:#4B5563;">We'll notify you as soon as your order is dispatched.</p>
    <p style="margin:0;color:#4B5563;">Thank you for choosing Sealed &amp; Secured.</p>
  `;
  return brandedEmail('Order Confirmed', content);
}
