import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

const PRODUCTS = [
  ["Cable Tie 100mm","ct-100mm","Cable Tie 100mm - PA66 (Nylon 6/6), 100 x 2.5 x 1.1 mm","Plastic Cable Ties",12.87,"Pack of 100",100],
  ["Cable Tie 150mm","ct-150mm","Cable Tie 150mm - PA66 (Nylon 6/6), 150 x 3.6 x 1.3 mm","Plastic Cable Ties",25.73,"Pack of 100",100],
  ["Cable Tie 200mm","ct-200mm","Cable Tie 200mm - PA66 (Nylon 6/6), 200 x 4.8 x 1.3 mm","Plastic Cable Ties",42.11,"Pack of 100",100],
  ["Cable Tie Slim 200mm","ct-slim-200mm","Cable Tie Slim 200mm - PA66 (Nylon 6/6), 200 x 3.6 x 1.1 mm","Plastic Cable Ties",37.45,"Pack of 100",100],
  ["Cable Tie Heavy Duty 200mm","ct-heavy-duty-200mm","Cable Tie Heavy Duty 200mm - PA66 (Nylon 6/6), 200 x 7.6 x 1.9 mm","Plastic Cable Ties",109.98,"Pack of 100",100],
  ["Cable Tie 300mm","ct-300mm","Cable Tie 300mm - PA66 (Nylon 6/6), 300 x 4.8 x 1.3 mm","Plastic Cable Ties",70.18,"Pack of 100",100],
  ["Cable Tie Heavy Duty 300mm","ct-heavy-duty-300mm","Cable Tie Heavy Duty 300mm - PA66 (Nylon 6/6), 300 x 7.6 x 1.9 mm","Plastic Cable Ties",126.33,"Pack of 100",100],
  ["Cable Tie 400mm","ct-400mm","Cable Tie 400mm - PA66 (Nylon 6/6), 400 x 4.8 x 1.3 mm","Plastic Cable Ties",84.22,"Pack of 100",100],
  ["Cable Tie Heavy Duty 400mm","ct-heavy-duty-400mm","Cable Tie Heavy Duty 400mm - PA66 (Nylon 6/6), 400 x 7.6 x 1.9 mm","Plastic Cable Ties",161.42,"Pack of 100",100],
  ["Cable Tie Heavy Duty 500mm","ct-heavy-duty-500mm","Cable Tie Heavy Duty 500mm - PA66 (Nylon 6/6), 500 x 7.6 x 1.9 mm","Plastic Cable Ties",222.44,"Pack of 100",100],
  ["Cable Tie Extra Heavy Duty 540mm","ct-extra-heavy-duty-540mm","Cable Tie Extra Heavy Duty 540mm - PA66 (Nylon 6/6), 540 x 13 x 2.3 mm","Plastic Cable Ties",231.6,"Pack of 50",50],

  ["SS Cable Tie 4.6x150mm","ss-4-6-150mm","Stainless Steel 304 cable tie, 4.6 x 150 mm. Corrosion resistant. Pack of 100.","Stainless Steel Cable Ties",218.14,"Pack of 100",100],
  ["SS Cable Tie 4.6x200mm","ss-4-6-200mm","Stainless Steel 304 cable tie, 4.6 x 200 mm. Corrosion resistant. Pack of 100.","Stainless Steel Cable Ties",249.65,"Pack of 100",100],
  ["SS Cable Tie 4.6x250mm","ss-4-6-250mm","Stainless Steel 304 cable tie, 4.6 x 250 mm. Corrosion resistant. Pack of 100.","Stainless Steel Cable Ties",278.74,"Pack of 100",100],
  ["SS Cable Tie 4.6x300mm","ss-4-6-300mm","Stainless Steel 304 cable tie, 4.6 x 300 mm. Corrosion resistant. Pack of 100.","Stainless Steel Cable Ties",298.12,"Pack of 100",100],
  ["SS Cable Tie 4.6x350mm","ss-4-6-350mm","Stainless Steel 304 cable tie, 4.6 x 350 mm. Corrosion resistant. Pack of 100.","Stainless Steel Cable Ties",344.18,"Pack of 100",100],
  ["SS Cable Tie 4.6x400mm","ss-4-6-400mm","Stainless Steel 304 cable tie, 4.6 x 400 mm. Corrosion resistant. Pack of 100.","Stainless Steel Cable Ties",380.54,"Pack of 100",100],
  ["SS Cable Tie 4.6x450mm","ss-4-6-450mm","Stainless Steel 304 cable tie, 4.6 x 450 mm. Corrosion resistant. Pack of 100.","Stainless Steel Cable Ties",421.74,"Pack of 100",100],
  ["SS Cable Tie 4.6x500mm","ss-4-6-500mm","Stainless Steel 304 cable tie, 4.6 x 500 mm. Corrosion resistant. Pack of 100.","Stainless Steel Cable Ties",458.10,"Pack of 100",100],
  ["SS Cable Tie 4.6x550mm","ss-4-6-550mm","Stainless Steel 304 cable tie, 4.6 x 550 mm. Corrosion resistant. Pack of 100.","Stainless Steel Cable Ties",492.03,"Pack of 100",100],
  ["SS Cable Tie 4.6x600mm","ss-4-6-600mm","Stainless Steel 304 cable tie, 4.6 x 600 mm. Corrosion resistant. Pack of 100.","Stainless Steel Cable Ties",528.38,"Pack of 100",100],
  ["SS Cable Tie 7.9x200mm","ss-7-9-200mm","Stainless Steel 304 cable tie, 7.9 x 200 mm. Corrosion resistant. Pack of 100.","Stainless Steel Cable Ties",325.59,"Pack of 100",100],
  ["SS Cable Tie 7.9x250mm","ss-7-9-250mm","Stainless Steel 304 cable tie, 7.9 x 250 mm. Corrosion resistant. Pack of 100.","Stainless Steel Cable Ties",357.10,"Pack of 100",100],
  ["SS Cable Tie 7.9x300mm","ss-7-9-300mm","Stainless Steel 304 cable tie, 7.9 x 300 mm. Corrosion resistant. Pack of 100.","Stainless Steel Cable Ties",411.64,"Pack of 100",100],
  ["SS Cable Tie 7.9x350mm","ss-7-9-350mm","Stainless Steel 304 cable tie, 7.9 x 350 mm. Corrosion resistant. Pack of 100.","Stainless Steel Cable Ties",441.13,"Pack of 100",100],
  ["SS Cable Tie 7.9x400mm","ss-7-9-400mm","Stainless Steel 304 cable tie, 7.9 x 400 mm. Corrosion resistant. Pack of 100.","Stainless Steel Cable Ties",495.74,"Pack of 100",100],
  ["SS Cable Tie 7.9x450mm","ss-7-9-450mm","Stainless Steel 304 cable tie, 7.9 x 450 mm. Corrosion resistant. Pack of 100.","Stainless Steel Cable Ties",532.43,"Pack of 100",100],
  ["SS Cable Tie 7.9x500mm","ss-7-9-500mm","Stainless Steel 304 cable tie, 7.9 x 500 mm. Corrosion resistant. Pack of 100.","Stainless Steel Cable Ties",532.43,"Pack of 100",100],
  ["SS Cable Tie 7.9x550mm","ss-7-9-550mm","Stainless Steel 304 cable tie, 7.9 x 550 mm. Corrosion resistant. Pack of 100.","Stainless Steel Cable Ties",567.16,"Pack of 100",100],
  ["SS Cable Tie 7.9x600mm","ss-7-9-600mm","Stainless Steel 304 cable tie, 7.9 x 600 mm. Corrosion resistant. Pack of 100.","Stainless Steel Cable Ties",661.12,"Pack of 100",100],
  ["SS Cable Tie 7.9x650mm","ss-7-9-650mm","Stainless Steel 304 cable tie, 7.9 x 650 mm. Corrosion resistant. Pack of 100.","Stainless Steel Cable Ties",707.91,"Pack of 100",100],
  ["SS Cable Tie 7.9x700mm","ss-7-9-700mm","Stainless Steel 304 cable tie, 7.9 x 700 mm. Corrosion resistant. Pack of 100.","Stainless Steel Cable Ties",736.74,"Pack of 100",100],
  ["SS Cable Tie 7.9x750mm","ss-7-9-750mm","Stainless Steel 304 cable tie, 7.9 x 750 mm. Corrosion resistant. Pack of 100.","Stainless Steel Cable Ties",796.13,"Pack of 100",100],
  ["SS Cable Tie 7.9x800mm","ss-7-9-800mm","Stainless Steel 304 cable tie, 7.9 x 800 mm. Corrosion resistant. Pack of 100.","Stainless Steel Cable Ties",833.94,"Pack of 100",100],
  ["Steel Cable Tie Installation Tool","ss-installation-tool","Steel cable tie installation tool for Stainless Steel ties.","Stainless Steel Cable Ties",1980.34,"Pack of 1",1],
];

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL || "",
  authToken: process.env.TURSO_AUTH_TOKEN || "",
});

export async function GET() {
  try {
    // First delete all existing CT products
    await turso.execute({ sql: "DELETE FROM Product WHERE category = 'Plastic Cable Ties'" });
    
    // Then insert the new merged products
    const results = [];
    for (const [name, slug, description, category, price, unit, stock] of PRODUCTS) {
      await turso.execute({
        sql: "INSERT INTO Product (name, slug, description, category, price, unit, minOrder, stock, isActive, imageUrl, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, '', datetime('now'), datetime('now'))",
        args: [name, slug, description, category, price, unit, stock, stock],
      });
      results.push("Seeded: " + slug);
    }
    return NextResponse.json({ seeded: results, deleted: "All old CT products removed" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
