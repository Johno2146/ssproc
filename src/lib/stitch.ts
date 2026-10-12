import crypto from "crypto";

/**
 * Stitch (stitch.money) hosted-card payment client — server-only.
 *
 * Flow (mirrors the PayFast redirect model, per Stitch's "Stitch-Hosted UI"
 * docs): create a payment request via the Stitch GraphQL API, redirect the
 * customer to the returned hosted URL (card capture + 3DS), then mark the
 * order paid from Stitch's SIGNED webhook — never from the return redirect
 * query string (anyone can fabricate `?status=complete`).
 *
 * Credentials (read from Settings → Secrets, exactly these names):
 *   STITCH_CLIENT_ID       — Stitch-supplied OAuth2 client id
 *   STITCH_CLIENT_SECRET   — Stitch-supplied client secret
 *   STITCH_WEBHOOK_SECRET  — Svix signing secret ("whsec_...") for the webhook
 *
 * Endpoints (same URLs work for test and live clients — the client_id
 * determines the environment):
 *   POST https://secure.stitch.money/connect/token   (OAuth2 client_credentials)
 *   POST https://api.stitch.money/graphql            (create payment request)
 *
 * Amounts: Stitch's Money.quantity is a Decimal in MAJOR units for the
 * currency (e.g. "550.00" for R550.00 — per the Money scalar doc example
 * {"quantity":"100.23","currency":"ZMW"}). Our checkout totals are already
 * in Rand, so we send total.toFixed(2).
 */

export const STITCH_TOKEN_URL = "https://secure.stitch.money/connect/token";
export const STITCH_GRAPHQL_URL = "https://api.stitch.money/graphql";
export const STITCH_SCOPE = "client_paymentrequest";

export class StitchError extends Error {
  status: number;
  code: string;
  constructor(message: string, status = 502, code = "STITCH_ERROR") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function isStitchConfigured(): boolean {
  return Boolean(process.env.STITCH_CLIENT_ID && process.env.STITCH_CLIENT_SECRET);
}

function missingConfigMessage(): string {
  return "Stitch payment is not configured yet (STITCH_CLIENT_ID / STITCH_CLIENT_SECRET missing). Please use PayFast.";
}

/* ------------------------------------------------------------------ */
/* OAuth2 client token (cached for its lifetime, default 3600s)        */
/* ------------------------------------------------------------------ */
let tokenCache: { accessToken: string; expiresAt: number } | null = null;

export async function getStitchClientToken(): Promise<string> {
  const clientId = process.env.STITCH_CLIENT_ID;
  const clientSecret = process.env.STITCH_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new StitchError(missingConfigMessage(), 500, "STITCH_NOT_CONFIGURED");
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) return tokenCache.accessToken;

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: STITCH_SCOPE,
    audience: STITCH_TOKEN_URL,
  });

  let res: Response;
  try {
    res = await fetch(STITCH_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      cache: "no-store",
    });
  } catch (e: any) {
    throw new StitchError(`Could not reach Stitch token endpoint: ${e?.message || e}`, 502, "STITCH_NETWORK");
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.access_token) {
    throw new StitchError(
      `Stitch token request failed (HTTP ${res.status}): ${JSON.stringify(json).slice(0, 300)}`,
      502,
      "STITCH_TOKEN_FAILED",
    );
  }
  const expiresIn = Number(json.expires_in) || 3600;
  tokenCache = { accessToken: json.access_token, expiresAt: Date.now() + expiresIn * 1000 };
  return tokenCache.accessToken;
}

/* ------------------------------------------------------------------ */
/* Create a hosted-card payment request                                */
/* ------------------------------------------------------------------ */
export interface StitchCreateOptions {
  /** Total in Rand (already includes shipping). Sent as decimal string. */
  amount: number;
  /** Our order number, e.g. "SS-1021". Returned to us by the redirect + webhook. */
  externalReference: string;
  /** Stable internal payer id (order id works). */
  payerReference: string;
  payerEmail?: string;
  payerFullName?: string;
  /** Passed through to the payment request + webhook node. */
  metadata: Record<string, string>;
  /** HTTPS redirect targets (domain must be allowlisted for the Stitch client). */
  redirectUri: string;
  failureRedirectUri?: string;
}

export interface StitchPaymentRequest {
  id: string;
  url: string;
  externalReference: string | null;
}

const CREATE_PAYMENT_REQUEST_QUERY = /* GraphQL */ `
  mutation CreatePaymentRequest(
    $amount: MoneyInput!
    $externalReference: String
    $payerReference: String!
    $payerInformation: PayerInformationInput
    $metadata: Json
    $expireAt: Date
    $paymentMethods: PaymentMethodsInput
  ) {
    clientPaymentInitiationRequestCreate(
      input: {
        amount: $amount
        externalReference: $externalReference
        payerReference: $payerReference
        payerInformation: $payerInformation
        metadata: $metadata
        expireAt: $expireAt
        paymentMethods: $paymentMethods
      }
    ) {
      paymentInitiationRequest {
        id
        url
        externalReference
      }
    }
  }
`;

export async function createStitchPaymentRequest(opts: StitchCreateOptions): Promise<StitchPaymentRequest> {
  const token = await getStitchClientToken();

  const expireAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h — Stitch strongly recommends expiry
  const payeeName = opts.payerFullName || opts.payerEmail || undefined;

  const variables = {
    amount: { quantity: (Math.round(opts.amount * 100) / 100).toFixed(2), currency: "ZAR" },
    externalReference: opts.externalReference,
    payerReference: opts.payerReference,
    payerInformation: {
      ...(opts.payerEmail ? { email: opts.payerEmail } : {}),
      ...(payeeName ? { fullName: payeeName } : {}),
      payerId: opts.payerReference,
    },
    metadata: {
      ...opts.metadata,
      // Stringified nested objects per Stitch's Json requirement
      billingAddress: JSON.stringify({}),
      shippingAddress: JSON.stringify({}),
      deliveryMethod: opts.metadata.deliveryMethod || "delivery",
    },
    expireAt,
    paymentMethods: { card: { enabled: true }, eft: { enabled: false } },
  };

  // redirect_uri is appended to the returned URL by the caller (see appendRedirectUris)
  let res: Response;
  try {
    res = await fetch(STITCH_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query: CREATE_PAYMENT_REQUEST_QUERY, variables }),
      cache: "no-store",
    });
  } catch (e: any) {
    throw new StitchError(`Could not reach Stitch GraphQL API: ${e?.message || e}`, 502, "STITCH_NETWORK");
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.errors) {
    const err = Array.isArray(json.errors) ? (json.errors[0] as any) : null;
    const message = err?.message || `Stitch create request failed (HTTP ${res.status})`;
    throw new StitchError(message, 502, err?.extensions?.code || "STITCH_CREATE_FAILED");
  }

  const node = json?.data?.clientPaymentInitiationRequestCreate?.paymentInitiationRequest;
  if (!node?.id || !node?.url) {
    throw new StitchError("Stitch create request returned no payment request id/url", 502, "STITCH_CREATE_EMPTY");
  }
  return {
    id: node.id as string,
    url: appendRedirectUris(node.url, opts.redirectUri, opts.failureRedirectUri),
    externalReference: (node.externalReference as string) || null,
  };
}

/**
 * Stitch validates the redirect URI domain against the client's allowlist, so
 * we have to append it ourselves on every request. Both URIs get the same
 * query params back from Stitch: id, status, payment_method, externalReference.
 */
export function appendRedirectUris(baseUrl: string, redirectUri: string, failureRedirectUri?: string): string {
  const u = new URL(baseUrl);
  u.searchParams.set("redirect_uri", redirectUri);
  if (failureRedirectUri) u.searchParams.set("failure_redirect_uri", failureRedirectUri);
  return u.toString();
}

/* ------------------------------------------------------------------ */
/* Webhook signature verification (Svix) — implemented with node:crypto */
/* so we don't need the svix dependency.                               */
/* ------------------------------------------------------------------ */
const SVIX_TIMESTAMP_TOLERANCE_SECONDS = 300;

export interface SvixHeaders {
  "svix-id"?: string | null;
  "svix-timestamp"?: string | null;
  "svix-signature"?: string | null;
}

/**
 * Verify a Stitch (Svix) webhook: HMAC-SHA256 of
 * `${svix-id}.${svix-timestamp}.${rawBody}` using the base64-decoded webhook
 * secret, matching any `v1,<hex>` entry in the svix-signature header, within
 * the timestamp tolerance. Constant-time comparison. Throws StitchError on any
 * failure.
 */
export function verifyStitchWebhookSignature(rawBody: string, headers: SvixHeaders): void {
  const secret = process.env.STITCH_WEBHOOK_SECRET || "";
  if (!secret) throw new StitchError("STITCH_WEBHOOK_SECRET is not configured", 500, "STITCH_WEBHOOK_NOT_CONFIGURED");

  const id = headers["svix-id"];
  const ts = headers["svix-timestamp"];
  const sigHeader = headers["svix-signature"];
  if (!id || !ts || !sigHeader) throw new StitchError("Missing Svix signature headers", 401, "STITCH_WH_BAD_HEADERS");

  // Timestamp replay guard (default Svix tolerance is 5 minutes)
  const tsSec = Number(ts);
  if (!Number.isFinite(tsSec) || Math.abs(Date.now() / 1000 - tsSec) > SVIX_TIMESTAMP_TOLERANCE_SECONDS) {
    throw new StitchError("Svix timestamp outside tolerance", 401, "STITCH_WH_STALE");
  }

  // Svix signing key = base64-decoded bytes after the "whsec_" prefix.
  const encoded = secret.startsWith("whsec_") ? secret.slice("whsec_".length) : secret;
  let keyBytes: Buffer;
  try {
    keyBytes = Buffer.from(encoded, "base64");
  } catch {
    keyBytes = Buffer.from(secret, "utf8");
  }
  if (keyBytes.length === 0) keyBytes = Buffer.from(secret, "utf8");

  const signedContent = `${id}.${ts}.${rawBody}`;
  const expected = crypto.createHmac("sha256", keyBytes).update(signedContent, "utf8").digest("hex");

  const presented = sigHeader.split(" ").map((s) => s.trim()).filter(Boolean);
  const matched = presented.some((entry) => {
    const m = entry.match(/^v1,([0-9a-fA-F]{64})$/);
    if (!m) return false;
    const given = m[1].toLowerCase();
    return timingSafeEqualHex(expected, given);
  });
  if (!matched) throw new StitchError("Svix signature mismatch", 401, "STITCH_WH_BAD_SIGNATURE");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const ab = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

/* ------------------------------------------------------------------ */
/* Payload helpers                                                     */
/* ------------------------------------------------------------------ */

/** Pull the PaymentInitiationRequest node out of a webhook payload. */
export function extractPaymentRequestNode(payload: any): any {
  if (!payload || typeof payload !== "object") return null;
  return (
    payload?.data?.client?.paymentInitiationRequests?.node ||
    payload?.data?.paymentInitiationRequests?.node ||
    payload?.data?.node ||
    payload?.node ||
    payload?.paymentInitiationRequest ||
    null
  );
}

/** true when the node's terminal state is the completed/successful one. */
export function isCompletedState(node: any): boolean {
  const typename = node?.state?.__typename || "";
  return typeof typename === "string" && typename.includes("Completed");
}

export const STITCH_STATE_COMPLETED = "PaymentInitiationRequestCompleted";
export const STITCH_STATE_CANCELLED = "PaymentInitiationRequestCancelled";
export const STITCH_STATE_EXPIRED = "PaymentInitiationRequestExpired";
export const STITCH_STATE_PENDING = "PaymentInitiationRequestPending";