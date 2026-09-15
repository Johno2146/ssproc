import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@libsql/client";
import { sendEmailWithResult } from "@/lib/email";

// LIVE Turso contact-submission persistence + Resend notification to
// sales@ssproc.co.za (owner-approved 2026-09-14: kill Formspree, use our own
// stack so enquiries land in the owner's inbox, not spam).
const turso = createClient({
  url: process.env.TURSO_DATABASE_URL || "",
  authToken: process.env.TURSO_AUTH_TOKEN || "",
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const company = typeof body?.company === "string" ? body.company.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Please provide your name." }, { status: 400 });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
  }
  if (!message) {
    return NextResponse.json({ error: "Please provide a message." }, { status: 400 });
  }

  const timestamp = new Date().toISOString();

  // 1) Persist to the live Turso DB (idempotent table, UUID id).
  try {
    await turso.execute({
      sql: `CREATE TABLE IF NOT EXISTS ContactSubmission (
        id TEXT PRIMARY KEY,
        timestamp TEXT,
        name TEXT,
        email TEXT,
        company TEXT,
        message TEXT
      )`,
    });
    await turso.execute({
      sql: "INSERT INTO ContactSubmission (id, timestamp, name, email, company, message) VALUES (?, ?, ?, ?, ?, ?)",
      args: [crypto.randomUUID(), timestamp, name, email, company, message],
    });
  } catch (e: any) {
    console.error("[CONTACT DB ERROR]", e);
    return NextResponse.json(
      { error: "We couldn't save your enquiry. Please try again or email sales@ssproc.co.za." },
      { status: 500 }
    );
  }

  // 2) Notify sales@ssproc.co.za via Resend (reply-to = the submitter).
  const emailBody = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Company: ${company || "(not provided)"}`,
    ``,
    `Message:`,
    message,
    ``,
    `Sent: ${timestamp}`,
  ].join("\n");

  const result = await sendEmailWithResult(
    "sales@ssproc.co.za",
    `New website enquiry — ${name}`,
    emailBody,
    { replyTo: email }
  );

  // 200 ONLY when both the Turso insert AND Resend accept succeeded.
  if (!result.ok) {
    return NextResponse.json(
      { error: "Your enquiry was saved but the notification could not be sent. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, emailId: result.id ?? null });
}