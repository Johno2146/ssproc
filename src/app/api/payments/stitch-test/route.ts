import { NextResponse } from "next/server";
import {
  STITCH_TOKEN_URL,
  STITCH_GRAPHQL_URL,
  STITCH_SCOPE,
} from "@/lib/stitch";

/**
 * DIAGNOSTIC ONLY — build a fresh probe of the Stitch OAuth2 token endpoint.
 * Lists WHAT the server holds (masked client id, secret length, webhook flag)
 * and performs a real token POST with the exact same params as
 * getStitchClientToken(), so we can see why Stitch answers invalid_client.
 *
 * No auth, but the response contains NO secrets:
 *  - clientIdMasked       first 6 + "…" + last 4 chars, plus total length
 *  - clientSecretLength   number, or "missing"
 *  - hasWebhookSecret     boolean
 *  - tokenUrl/graphqlUrl/scope  constants from stitch.ts
 *  - tokenStatus          HTTP status of the token POST
 *  - tokenBody            Stitch's raw response, truncated ~400 chars, with
 *                         any access_token / id_token / refresh_token redacted
 *                         (a successful call must not leak a live token).
 *
 * Each call is a fresh probe (own fetch, NOT the cached helper in stitch.ts).
 * Temporary tool — remove once the invalid_client issue is resolved.
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

  return NextResponse.json({
    clientIdMasked: mask(clientId),
    clientSecretLength: clientSecret ? clientSecret.length : "missing",
    hasWebhookSecret: Boolean(webhookSecret),
    tokenUrl: STITCH_TOKEN_URL,
    graphqlUrl: STITCH_GRAPHQL_URL,
    scope: STITCH_SCOPE,
    tokenStatus,
    tokenBody: truncated,
  });
}