import { NextResponse } from "next/server";
import { getClient } from "@/lib/db";
import { auth } from "@/lib/auth";

/**
 * Admin-only reconciliation: manually flip a PENDING order to paid after the
 * owner confirms the payment in the PayFast dashboard (used when an ITN was
 * lost — e.g. the localhost notify_url bug — and the automatic flow could not
 * complete). Only pending -> paid; never touches paid/cancelled orders.
 * Appends an audit note to the order's notes column.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const client = getClient();

    const res = await client.execute({
      sql: `SELECT * FROM "Order" WHERE id = ?`,
      args: [id],
    });
    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const order = res.rows[0] as any;

    if (order.status !== "pending") {
      return NextResponse.json(
        { error: `Only pending orders can be marked paid (current status: ${order.status})` },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const auditNote = `[${now}] Marked paid by admin (manual reconciliation after PayFast dashboard confirmation)`;
    const newNotes = order.notes ? `${order.notes} | ${auditNote}` : auditNote;

    await client.execute({
      sql: `UPDATE "Order" SET status = 'paid', paidAt = ?, updatedAt = ?, notes = ? WHERE id = ?`,
      args: [now, now, newNotes, id],
    });

    const updated = await client.execute({
      sql: `SELECT * FROM "Order" WHERE id = ?`,
      args: [id],
    });

    console.log(`[Admin] Order ${order.orderNumber} (${id}) manually marked as paid by ${(session.user as any).email}`);
    return NextResponse.json({ ok: true, order: updated.rows[0] });
  } catch (error) {
    console.error("Error marking order paid:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
