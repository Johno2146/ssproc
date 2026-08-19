import { NextResponse } from "next/server";
import { getClient } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const client = getClient();
    const res = await client.execute(
      "SELECT * FROM User ORDER BY createdAt DESC"
    );
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
