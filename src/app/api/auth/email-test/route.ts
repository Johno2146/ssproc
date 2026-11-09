import { NextRequest, NextResponse } from "next/server";
import {
  getFromEmail,
  VERIFIED_FROM,
  sendEmailWithResult,
  sendOtpEmailWithResult,
  type EmailResult,
} from "@/lib/email";

/**
 * DIAGNOSTIC ONLY — answers "why does customer registration not send the OTP
 * email?" without leaking secrets.
 *
 * GET /api/auth/email-test[?to=<team inbox>][&dry=1]
 *   Auth: `Authorization: Bearer <OUTREACH_API_TOKEN>` (same token as
 *   /api/outreach/send). Without it this returns 403 — it is not public.
 *
 * Reports (NO secrets):
 *   hasResendApiKey      boolean — is RESEND_API_KEY present in the runtime env
 *   resendApiKey         masked shape only (prefix + length), never the value
 *   resendEmailFromSet   boolean — is RESEND_EMAIL_FROM set
 *   effectiveFrom        the sender app mail actually uses
 *   verifiedFrom         the sender proven to deliver (used by /api/outreach/send)
 *   otpPath              result of sendOtpEmailWithResult() — the exact call
 *                        /api/auth/register makes, with the real Resend error
 *   appPath              result of sendEmailWithResult() (order/contact path)
 *
 * Recipients are restricted to the team's own @ctomail.io inboxes so this can
 * never be used to mail a third party. `dry=1` performs no send at all.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_TO = "sealed-and-secured-0506afbd@ctomail.io";
const TEAM_INBOX_RE = /^[a-z0-9][a-z0-9._-]*@ctomail\.io$/i;

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Never return a key value — only enough shape to tell keys apart. */
function maskSecret(v?: string): string | null {
  if (!v) return null;
  if (v.length <= 10) return `too-short (len ${v.length})`;
  return `${v.slice(0, 4)}…${v.slice(-4)} (len ${v.length})`;
}

/** Strip anything that looks like a credential out of provider error text. */
function redact(s: string): string {
  return s
    .replace(/re_[A-Za-z0-9_-]{6,}/g, "re_***")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer ***");
}

function leg(r: EmailResult) {
  return {
    ok: r.ok,
    resendId: r.id ?? null,
    from: r.from ?? null,
    usedFallbackFrom: r.usedFallbackFrom ?? false,
    error: r.error
      ? {
          name: r.error.name,
          statusCode: r.error.statusCode ?? null,
          message: redact(r.error.message),
        }
      : null,
  };
}

function diagnose(hasKey: boolean, otp: EmailResult): string {
  if (!hasKey) {
    return "RESEND_API_KEY is NOT set in the live environment — no mail can be sent. Owner must add it.";
  }
  if (otp.ok) {
    return otp.usedFallbackFrom
      ? "Working via fallback: the configured sender is rejected by Resend, but mail still delivers from sales@ssproc.co.za."
      : "Working: OTP mail accepted by Resend from the configured sender.";
  }
  const msg = `${otp.error?.name ?? ""} ${otp.error?.message ?? ""}`.toLowerCase();
  if (msg.includes("not verified") || msg.includes("unverified") || msg.includes("domain is not verified")) {
    return "Sender address is not verified in Resend — change the from-address to the verified sales@ssproc.co.za identity.";
  }
  if (msg.includes("api key") || msg.includes("unauthorized") || msg.includes("invalid api")) {
    return "Resend rejected the API key (invalid/revoked) — owner must save a valid RESEND_API_KEY.";
  }
  if (msg.includes("validation")) {
    return "Resend rejected the request payload (validation error) — see error.message.";
  }
  return "Resend rejected the send for the reason in error.message.";
}

export async function GET(req: NextRequest) {
  const expected = process.env.OUTREACH_API_TOKEN;
  const auth = req.headers.get("authorization") ?? "";
  const supplied = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length) : "";
  if (!expected || !supplied || !safeEqual(supplied, expected)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const to = (url.searchParams.get("to") || DEFAULT_TO).trim();
  if (!TEAM_INBOX_RE.test(to)) {
    return NextResponse.json(
      { error: "to must be one of the team's own @ctomail.io inboxes" },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const effectiveFrom = getFromEmail();

  const env = {
    hasResendApiKey: Boolean(apiKey),
    resendApiKey: maskSecret(apiKey),
    resendEmailFromSet: Boolean(process.env.RESEND_EMAIL_FROM),
    resendEmailFromRaw: process.env.RESEND_EMAIL_FROM ?? null,
    effectiveFrom,
    verifiedFrom: VERIFIED_FROM,
    senderIsVerifiedFrom: effectiveFrom === VERIFIED_FROM,
    nodeEnv: process.env.NODE_ENV ?? null,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? null,
  };

  if (url.searchParams.get("dry") === "1") {
    return NextResponse.json({ env, dryRun: true });
  }

  // Leg 1: the exact call /api/auth/register makes.
  const otpResult = await sendOtpEmailWithResult(to, "Email diagnostic", "000000");
  // Leg 2: the generic app path (order confirmations / contact notifications).
  const appResult = await sendEmailWithResult(
    to,
    "Sealed & Secured email diagnostic",
    "Diagnostic message from /api/auth/email-test. Safe to ignore.",
    { replyTo: "sales@ssproc.co.za" }
  );

  return NextResponse.json({
    env,
    to,
    otpPath: leg(otpResult),
    appPath: leg(appResult),
    diagnosis: diagnose(Boolean(apiKey), otpResult),
  });
}
