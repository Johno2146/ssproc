import crypto from "crypto";
import { NextResponse } from "next/server";
import {
  STITCH_TOKEN_URL,
  STITCH_GRAPHQL_URL,
  STITCH_SCOPE,
  verifyStitchWebhookSignature,
} from "@/lib/stitch";

/**
 * DIAGNOSTIC ONLY — fresh probe of the Stitch OAuth2 token endpoint PLUS a
 * webhook-leg self-test. No auth, and the response contains NO secrets:
 *
 * Token leg (same params as getStitchClientToken(), own uncached fetch):
 *  - clientIdMasked       first 6 + "…" + last 4 chars, plus total length
 *  - clientSecretLength   number, or "missing"
 *  - tokenUrl/graphqlUrl/scope  constants from stitch.ts
 *  - tokenStatus          HTTP status of the token POST
 *  - tokenBody            Stitch's raw response, truncated ~400 chars,
 *                         access_token/id_token/refresh_token redacted.
 *
 * Webhook leg (proves STITCH_WEBHOOK_SECRET is self-consistent with our
 * Svix verifier — i.e. the handler would accept real Stitch webhooks when
 * the SAME secret is what Svix signs with):
 *  - webhookSecret: { present, hasWhsecPrefix, length, masked(first 6 + last 3) }
 *  - webhookSelfTest: builds a correctly Svix-signed sample
 *    PaymentInitiationRequestCompleted payload (fake externalReference,
 *    no real order data) and runs it through verifyStitchWebhookSignature()
 *    (which reads the env secret itself) → sigOk true/false. Also a tampered
 *    negative control → tamperedSigRejected. NO DB writes, NO emails, NO
 *    outbound POST — read-only, local verification only.
 *
 * Temporary tool — remove once the Stitch invalid_client issue is resolved.
 */
export async function GET() {
  const clientId = process.env.STITCH_CLIENT_ID;
  const clientSecret = process.env.STITCH_CLIENT_SECRET;
  const webhookSecret = process.env.STITCH_WEBHOOK_SECRET;

  const mask = (s?: string) =>
    s && s.length >= 10
      ? `${s.slice(0, 6)}…${s.slice(-4)} (len ${s.length})`
      : s
        ? `too-short (len ${s.length})`
        : "missing";

  /* ---------------- Token leg ---------------- */
  let tokenStatus: number | "not-attempted" = "not-attempted";
  let tokenBody: unknown = null;

  if (clientId && clientSecret) {
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope: STITCH_SCOPE,
      audience: STITCH_TOKEN_URL,
    });
    try {
      const res = await fetch(STITCH_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        cache: "no-store",
      });
      tokenStatus = res.status;
      const json = await res.json().catch(() => null);
      // Never return a live token even on success.
      if (json && typeof json === "object") {
        for (const k of ["access_token", "id_token", "refresh_token"]) {
          if (json[k]) {
            json[k] = "[REDACTED]";
            json[`${k}_present`] = true;
          }
        }
      }
      tokenBody = json;
    } catch (e: any) {
      tokenStatus = "fetch-error";
      tokenBody = { error: String(e?.message || e).slice(0, 300) };
    }
  }

  const raw = JSON.stringify(tokenBody) || "null";
  const truncated = raw.length > 400 ? `${raw.slice(0, 400)}…(truncated)` : raw;

  /* ---------------- Webhook leg ---------------- */
  const wh = {
    present: Boolean(webhookSecret),
    hasWhsecPrefix: webhookSecret ? webhookSecret.startsWith("whsec_") : false,
    length: webhookSecret ? webhookSecret.length : "missing",
    masked: webhookSecret
      ? webhookSecret.length >= 10
        ? `${webhookSecret.slice(0, 6)}…${webhookSecret.slice(-3)} (len ${webhookSecret.length})`
        : `too-short (len ${webhookSecret.length})`
      : "missing",
  };

  let webhookSelfTest: Record<string, unknown> = { tested: false };
  if (webhookSecret) {
    // Build a correctly Svix-signed sample completed payload (fake reference —
    // even if it ever reached the webhook route it would only log-and-ack).
    const svixId = `msg_diag_${Date.now()}`;
    const svixTs = String(Math.floor(Date.now() / 1000));
    const samplePayload = {
      data: {
        client: {
          paymentInitiationRequests: {
            node: {
              id: "pir_diag_0000000000",
              externalReference: "SS-DIAG-NOORDER",
              state: { __typename: "PaymentInitiationRequestCompleted" },
              amount: { quantity: "1.00", currency: "ZAR" },
            },
          },
        },
      },
    };
    const rawBody = JSON.stringify(samplePayload);

    // Exactly what verifyStitchWebhookSignature does to derive the key.
    const encoded = wh.hasWhsecPrefix ? webhookSecret.slice("whsec_".length) : webhookSecret;
    let keyBytes = Buffer.from(encoded, "base64");
    if (keyBytes.length === 0) keyBytes = Buffer.from(webhookSecret, "utf8");

    const signedContent = `${svixId}.${svixTs}.${rawBody}`;
    const sig = crypto.createHmac("sha256", keyBytes).update(signedContent, "utf8").digest("hex");

    let sigOk = false;
    let sigError: string | null = null;
    try {
      verifyStitchWebhookSignature(rawBody, {
        "svix-id": svixId,
        "svix-timestamp": svixTs,
        "svix-signature": `v1,${sig}`,
      });
      sigOk = true;
    } catch (e: any) {
      sigError = String(e?.message || e).slice(0, 200);
    }

    // Negative control: a garbage signature must be rejected by the verifier.
    let tamperedSigRejected: boolean | "not-tested" = "not-tested";
    if (sigOk) {
      try {
        verifyStitchWebhookSignature(rawBody, {
          "svix-id": svixId,
          "svix-timestamp": svixTs,
          "svix-signature": `v1,${"0".repeat(64)}`,
        });
        tamperedSigRejected = false; // verifier accepted garbage — bad
      } catch {
        tamperedSigRejected = true; // correct behaviour
      }
    }

    webhookSelfTest = {
      tested: true,
      sampleExternalReference: samplePayload.data.client.paymentInitiationRequests.node.externalReference,
      sigOk,
      sigError,
      tamperedSigRejected,
    };
  }

  return NextResponse.json({
    clientIdMasked: mask(clientId),
    clientSecretLength: clientSecret ? clientSecret.length : "missing",
    hasWebhookSecret: wh.present,
    webhookSecret: wh,
    webhookSelfTest,
    tokenUrl: STITCH_TOKEN_URL,
    graphqlUrl: STITCH_GRAPHQL_URL,
    scope: STITCH_SCOPE,
    tokenStatus,
    tokenBody: truncated,
  });
}