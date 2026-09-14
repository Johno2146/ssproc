import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { outreachBrandedHtml } from "@/lib/email";

/**
 * POST /api/outreach/send
 * Sends outreach email through the store's Resend integration so mail
 * originates from sales@ssproc.co.za (owner directive) instead of the
 * team's AgentMail mailbox.
 *
 * Auth: `Authorization: Bearer <OUTREACH_API_TOKEN>` (server env only).
 * Body: { to: string[] (1-10), subject: string (<=200), html?: string, text?: string }
 *   - html: pre-built HTML content (used as-is).
 *   - text: plain text content (wrapped in the branded email shell when html
 *     is absent; also used as the text/plain alternative when html is present).
 */
const REPLY_TO = "sales@ssproc.co.za";
const DEFAULT_FROM = "Sealed and Secured <sales@ssproc.co.za>";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Constant-time string compare (length leak is acceptable and standard here). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function POST(req: NextRequest) {
  const expected = process.env.OUTREACH_API_TOKEN;
  const auth = req.headers.get("authorization") ?? "";
  const supplied = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length) : "";

  // Never reveal whether the env var is missing vs the token mismatching.
  if (!expected || !supplied || !safeEqual(supplied, expected)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let payload: { to?: unknown; subject?: unknown; html?: unknown; text?: unknown };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { to, subject, html, text } = payload ?? {};

  if (!Array.isArray(to) || to.length === 0 || to.length > 10) {
    return NextResponse.json(
      { error: "to must be an array of 1-10 email addresses" },
      { status: 400 }
    );
  }
  const recipients: string[] = [];
  for (const addr of to) {
    if (typeof addr !== "string" || !EMAIL_RE.test(addr.trim())) {
      return NextResponse.json(
        { error: "to contains an invalid email address" },
        { status: 400 }
      );
    }
    recipients.push(addr.trim());
  }

  const subjectStr = typeof subject === "string" ? subject.trim() : "";
  if (!subjectStr || subjectStr.length > 200) {
    return NextResponse.json(
      { error: "subject is required and must be 200 characters or fewer" },
      { status: 400 }
    );
  }

  let htmlContent: string;
  let textContent: string;
  if (typeof html === "string" && html.trim()) {
    htmlContent = html;
    textContent = typeof text === "string" && text.trim() ? text : html.replace(/<[^>]+>/g, "");
  } else if (typeof text === "string" && text.trim()) {
    textContent = text;
    htmlContent = outreachBrandedHtml(subjectStr, text);
  } else {
    return NextResponse.json(
      { error: "html or text content is required" },
      { status: 400 }
    );
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "Resend API key is not configured on the server" },
      { status: 500 }
    );
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.OUTREACH_FROM || DEFAULT_FROM;

  try {
    const { data, error } = await resend.emails.send({
      from,
      replyTo: REPLY_TO,
      to: recipients,
      subject: subjectStr,
      html: htmlContent,
      text: textContent,
    });
    if (error) {
      return NextResponse.json(
        { error: `Resend failed: ${error.message}` },
        { status: 500 }
      );
    }
    // Log only the recipient count + Resend id — never the token or body.
    console.log(`[OUTREACH SENT] recipients=${recipients.length} id=${data?.id}`);
    return NextResponse.json({ ok: true, id: data?.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: `Resend failed: ${msg}` }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}