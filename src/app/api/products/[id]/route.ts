import { NextResponse } from "next/server";
import { getClient } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = getClient();
    const res = await client.execute({
      sql: "SELECT * FROM Product WHERE id = ?",
      args: [id],
    });

    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, slug, description, category, price, unit, minOrder, stock, imageUrl, isActive } = body;

    const sets: string[] = [];
    const args: unknown[] = [];
    const push = (col: string, val: unknown) => {
      if (val !== undefined) {
        sets.push(`${col} = ?`);
        args.push(val);
      }
    };
    push("name", name);
    push("slug", slug);
    push("description", description);
    push("category", category);
    push("price", price ? parseFloat(price) : undefined);
    push("unit", unit);
    push("minOrder", minOrder ? parseInt(minOrder) : undefined);
    push("stock", stock ? parseInt(stock) : undefined);
    push("imageUrl", imageUrl);
    push("isActive", isActive);
    if (sets.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }
    sets.push("updatedAt = ?");
    args.push(new Date().toISOString());
    args.push(id);

    const client = getClient();
    await client.execute({
      sql: `UPDATE Product SET ${sets.join(", ")} WHERE id = ?`,
      args,
    });

    const res = await client.execute({
      sql: "SELECT * FROM Product WHERE id = ?",
      args: [id],
    });
    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    await client.execute({
      sql: "DELETE FROM Product WHERE id = ?",
      args: [id],
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
