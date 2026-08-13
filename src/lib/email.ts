import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.RESEND_EMAIL_FROM || 'orders@ssproc.co.za';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ssproc.vercel.app';
const LOGO_URL = `${SITE_URL}/assets/logo.png`;

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
              <img src="${LOGO_URL}" alt="Sealed &amp; Secured" style="height:48px;width:auto;display:block;">
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

export async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  // Detect if body is already HTML; if not, wrap in branded shell as plain text
  const isHtml = /<[a-z][\s\S]*>/i.test(body);
  const html = isHtml ? body : brandedEmail(subject, `<p style="margin:0 0 16px;white-space:pre-line;">${esc(body)}</p>`);
  const text = body.replace(/<[^>]+>/g, '');

  if (!resend) {
    console.log(`[EMAIL DISABLED] To: ${to}, Subject: ${subject}`);
    console.log(body);
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error(`[EMAIL ERROR] To: ${to}:`, error);
      return false;
    }

    console.log(`[EMAIL SENT] To: ${to}, ID: ${data?.id}`);
    return true;
  } catch (e) {
    console.error(`[EMAIL ERROR] To: ${to}:`, e);
    return false;
  }
}

export async function sendOtpEmail(email: string, name: string, otp: string): Promise<boolean> {
  const content = `
    <p style="margin:0 0 16px;">Hi ${esc(name)},</p>
    <p style="margin:0 0 20px;">Your verification code for Sealed &amp; Secured is:</p>
    <div style="text-align:center;margin:0 0 20px;">
      <span style="display:inline-block;font-size:28px;font-weight:700;letter-spacing:6px;color:${NAVY};background:${LIGHT_BG};border:1px dashed ${BLUE};border-radius:8px;padding:12px 24px;">${esc(otp)}</span>
    </div>
    <p style="margin:0 0 8px;color:#6B7280;font-size:13px;">This code expires in 15 minutes.</p>
    <p style="margin:0;color:#6B7280;font-size:13px;">If you didn't create an account, please ignore this email.</p>
  `;
  return sendEmail(email, `Your verification code: ${otp}`, brandedEmail('Verify your email', content));
}

// Build an HTML order items table
function orderItemsHtml(items: any[]): string {
  const rows = items.map((item: any) => {
    const name = item.productName || item.productId || 'Item';
    const qty = Number(item.quantity);
    const price = Number(item.price);
    const lineTotal = (qty * price).toFixed(2);
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
    <div style="text-align:right;font-size:16px;font-weight:700;color:${NAVY};">Order Total: R${total} <span style="font-weight:400;color:#6B7280;font-size:12px;">(incl. VAT)</span></div>
  `;
  return brandedEmail('New Order Received', content);
}

export function orderCustomerEmailHtml(order: any, orderItems: any[]): string {
  const total = Number(order.total).toFixed(2);
  const content = `
    <p style="margin:0 0 16px;">Hi ${esc(order.shippingName)},</p>
    <p style="margin:0 0 16px;">Thank you for your order with Sealed &amp; Secured. We've received your payment and your order is confirmed.</p>
    <div style="background:${LIGHT_BG};border-radius:8px;padding:16px;margin:0 0 16px;">
      <p style="margin:0;"><strong>Order Number:</strong> ${esc(order.orderNumber)}</p>
    </div>
    <p style="margin:0 0 8px;font-weight:600;">Your Items</p>
    ${orderItemsHtml(orderItems)}
    <div style="text-align:right;font-size:16px;font-weight:700;color:${NAVY};margin:0 0 20px;">Total: R${total} <span style="font-weight:400;color:#6B7280;font-size:12px;">(incl. VAT)</span></div>
    <p style="margin:0 0 8px;color:#4B5563;">We'll notify you as soon as your order is dispatched.</p>
    <p style="margin:0;color:#4B5563;">Thank you for choosing Sealed &amp; Secured.</p>
  `;
  return brandedEmail('Order Confirmed', content);
}
