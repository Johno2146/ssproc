import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { execSync } from "child_process";
import path from "path";

export async function POST(req: Request) {
  try {
    const { name, email, company, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    const timestamp = new Date().toISOString();
    const entry = { timestamp, name, email, company: company || "", message };

    // Save to file as backup
    const dir = "/home/team/shared/contact-submissions";
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
    const filename = `${timestamp.replace(/[:.]/g, "-")}-${name.replace(/\s+/g, "_")}.json`;
    await writeFile(path.join(dir, filename), JSON.stringify(entry, null, 2));

    // Save to database for forwarding
    const escapedName = name.replace(/'/g, "''");
    const escapedEmail = email.replace(/'/g, "''");
    const escapedCompany = (company || "").replace(/'/g, "''");
    const escapedMessage = message.replace(/'/g, "''");
    
    try {
      execSync(`team-db "INSERT INTO contact_submissions (timestamp, name, email, company, message) VALUES ('${timestamp}', '${escapedName}', '${escapedEmail}', '${escapedCompany}', '${escapedMessage}');"`, { timeout: 10000 });
    } catch (dbErr) {
      console.error("DB insert error:", dbErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ success: true });
  }
}