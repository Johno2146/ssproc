import { createClient } from "@libsql/client";

// Shared Turso/libsql client factory used by all API routes.
// DATABASE_URL is the Turso libsql URL and TURSO_AUTH_TOKEN the auth token
// (set in Vercel env for production; .env.local for local dev).
export function getClient() {
  return createClient({
    url: process.env.DATABASE_URL || "",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}
