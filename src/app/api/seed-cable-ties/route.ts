import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

const PRODUCTS = [
  ["CT Black 100mm","ct-black-100mm","CT Black 100mm - PA66 (Nylon 6/6), 100 x 2.5 x 1.1 mm, Black","Plastic Cable Ties",29.0,"Pack of 100",100],
  ["CT Colour 100mm","ct-colour-100mm","CT Colour 100mm - PA66 (Nylon 6/6), 100 x 2.5 x 1.1 mm, Black, White, Red, Blue, Green, Yellow, Orange, Purple, Pink, Brown, Navy, Lime, Silver","Plastic Cable Ties",32.0,"Pack of 100",100],
  ["CT Black 150mm","ct-black-150mm","CT Black 150mm - PA66 (Nylon 6/6), 150 x 3.6 x 1.3 mm, Black","Plastic Cable Ties",39.0,"Pack of 100",100],
  ["CT Colour 150mm","ct-colour-150mm","CT Colour 150mm - PA66 (Nylon 6/6), 150 x 3.6 x 1.3 mm, Black, White, Red, Blue, Green, Yellow, Orange, Purple, Pink, Brown, Navy, Lime, Silver","Plastic Cable Ties",42.0,"Pack of 100",100],
  ["CT Black 200mm","ct-black-200mm","CT Black 200mm - PA66 (Nylon 6/6), 200 x 4.8 x 1.3 mm, Black","Plastic Cable Ties",49.0,"Pack of 100",100],
  ["CT Colour 200mm","ct-colour-200mm","CT Colour 200mm - PA66 (Nylon 6/6), 200 x 4.8 x 1.3 mm, Black, White, Red, Blue, Green, Yellow, Orange, Purple, Pink, Brown, Navy, Lime, Silver","Plastic Cable Ties",52.0,"Pack of 100",100],
  ["CT Black Slim 200mm","ct-black-slim-200mm","CT Black Slim 200mm - PA66 (Nylon 6/6), 200 x 2.5 x 1.3 mm, Black","Plastic Cable Ties",39.0,"Pack of 100",100],
  ["CT Colour Slim 200mm","ct-colour-slim-200mm","CT Colour Slim 200mm - PA66 (Nylon 6/6), 200 x 2.5 x 1.3 mm, Black, White, Red, Blue, Green, Yellow, Orange, Purple, Pink, Brown, Navy, Lime, Silver","Plastic Cable Ties",42.0,"Pack of 100",100],
  ["CT Heavy Duty Black 200mm","ct-heavy-duty-black-200mm","CT Heavy Duty Black 200mm - PA66 (Nylon 6/6), 200 x 7.8 x 2.0 mm, Black","Plastic Cable Ties",69.0,"Pack of 100",100],
  ["CT Heavy Duty Colour 200mm","ct-heavy-duty-colour-200mm","CT Heavy Duty Colour 200mm - PA66 (Nylon 6/6), 200 x 7.8 x 2.0 mm, Black, White, Red, Blue, Green, Yellow, Orange, Purple, Pink, Brown, Navy, Lime, Silver","Plastic Cable Ties",75.0,"Pack of 100",100],
  ["CT Black 300mm","ct-black-300mm","CT Black 300mm - PA66 (Nylon 6/6), 300 x 4.8 x 1.3 mm, Black","Plastic Cable Ties",59.0,"Pack of 100",100],
  ["CT Colour 300mm","ct-colour-300mm","CT Colour 300mm - PA66 (Nylon 6/6), 300 x 4.8 x 1.3 mm, Black, White, Red, Blue, Green, Yellow, Orange, Purple, Pink, Brown, Navy, Lime, Silver","Plastic Cable Ties",62.0,"Pack of 100",100],
  ["CT Heavy Duty Black 300mm","ct-heavy-duty-black-300mm","CT Heavy Duty Black 300mm - PA66 (Nylon 6/6), 300 x 7.9 x 2.0 mm, Black","Plastic Cable Ties",89.0,"Pack of 100",100],
  ["CT Heavy Duty Colour 300mm","ct-heavy-duty-colour-300mm","CT Heavy Duty Colour 300mm - PA66 (Nylon 6/6), 300 x 7.9 x 2.0 mm, Black, White, Red, Blue, Green, Yellow, Orange, Purple, Pink, Brown, Navy, Lime, Silver","Plastic Cable Ties",95.0,"Pack of 100",100],
  ["CT Black 400mm","ct-black-400mm","CT Black 400mm - PA66 (Nylon 6/6), 400 x 4.8 x 1.3 mm, Black","Plastic Cable Ties",69.0,"Pack of 100",100],
  ["CT Colour 400mm","ct-colour-400mm","CT Colour 400mm - PA66 (Nylon 6/6), 400 x 4.8 x 1.3 mm, Black, White, Red, Blue, Green, Yellow, Orange, Purple, Pink, Brown, Navy, Lime, Silver","Plastic Cable Ties",72.0,"Pack of 100",100],
  ["CT Heavy Duty Black 400mm","ct-heavy-duty-black-400mm","CT Heavy Duty Black 400mm - PA66 (Nylon 6/6), 400 x 7.9 x 2.0 mm, Black","Plastic Cable Ties",99.0,"Pack of 100",100],
  ["CT Heavy Duty Colour 400mm","ct-heavy-duty-colour-400mm","CT Heavy Duty Colour 400mm - PA66 (Nylon 6/6), 400 x 7.9 x 2.0 mm, Black, White, Red, Blue, Green, Yellow, Orange, Purple, Pink, Brown, Navy, Lime, Silver","Plastic Cable Ties",105.0,"Pack of 100",100],
  ["CT Heavy Duty Black 500mm","ct-heavy-duty-black-500mm","CT Heavy Duty Black 500mm - PA66 (Nylon 6/6), 500 x 7.9 x 2.0 mm, Black","Plastic Cable Ties",119.0,"Pack of 100",100],
  ["CT Heavy Duty Colour 500mm","ct-heavy-duty-colour-500mm","CT Heavy Duty Colour 500mm - PA66 (Nylon 6/6), 500 x 7.9 x 2.0 mm, Black, White, Red, Blue, Green, Yellow, Orange, Purple, Pink, Brown, Navy, Lime, Silver","Plastic Cable Ties",125.0,"Pack of 100",100],
  ["CT Extra Heavy Duty Black 540mm","ct-extra-heavy-duty-black-540mm","CT Extra Heavy Duty Black 540mm - PA66 (Nylon 6/6), 540 x 13 x 2.3 mm, Black","Plastic Cable Ties",149.0,"Pack of 50",50],
  ["CT Extra Heavy Duty Colour 540mm","ct-extra-heavy-duty-colour-540mm","CT Extra Heavy Duty Colour 540mm - PA66 (Nylon 6/6), 540 x 13 x 2.3 mm, Black, White, Red, Blue, Green, Yellow, Orange, Purple, Pink, Brown, Navy, Lime, Silver","Plastic Cable Ties",159.0,"Pack of 50",50]
];
mport { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

const PRODUCTS = [
  ["CT Black 100mm","ct-black-100mm","Black nylon cable tie, 100mm length","Plastic Cable Ties",29.00,"Per 100",100],
  ["CT Colour 100mm","ct-colour-100mm","Assorted colour nylon cable tie, 100mm length","Plastic Cable Ties",32.00,"Per 100",100],
  ["CT Black 150mm","ct-black-150mm","Black nylon cable tie, 150mm length","Plastic Cable Ties",39.00,"Per 100",100],
  ["CT Colour 150mm","ct-colour-150mm","Assorted colour nylon cable tie, 150mm length","Plastic Cable Ties",42.00,"Per 100",100],
  ["CT Black 200mm","ct-black-200mm","Black nylon cable tie, 200mm length","Plastic Cable Ties",49.00,"Per 100",100],
  ["CT Colour 200mm","ct-colour-200mm","Assorted colour nylon cable tie, 200mm length","Plastic Cable Ties",52.00,"Per 100",100],
  ["CT Black Slim 200mm","ct-black-slim-200mm","Black slim nylon cable tie, 200mm length","Plastic Cable Ties",39.00,"Per 100",100],
  ["CT Colour Slim 200mm","ct-colour-slim-200mm","Assorted colour slim nylon cable tie, 200mm length","Plastic Cable Ties",42.00,"Per 100",100],
  ["CT Heavy Duty Black 200mm","ct-hd-black-200mm","Heavy duty black nylon cable tie, 200mm length","Plastic Cable Ties",69.00,"Per 100",100],
  ["CT Heavy Duty Colour 200mm","ct-hd-colour-200mm","Heavy duty assorted colour nylon cable tie, 200mm length","Plastic Cable Ties",75.00,"Per 100",100],
  ["CT Black 300mm","ct-black-300mm","Black nylon cable tie, 300mm length","Plastic Cable Ties",59.00,"Per 100",100],
  ["CT Colour 300mm","ct-colour-300mm","Assorted colour nylon cable tie, 300mm length","Plastic Cable Ties",62.00,"Per 100",100],
  ["CT Heavy Duty Black 300mm","ct-hd-black-300mm","Heavy duty black nylon cable tie, 300mm length","Plastic Cable Ties",89.00,"Per 100",100],
  ["CT Heavy Duty Colour 300mm","ct-hd-colour-300mm","Heavy duty assorted colour nylon cable tie, 300mm length","Plastic Cable Ties",95.00,"Per 100",100],
  ["CT Black 400mm","ct-black-400mm","Black nylon cable tie, 400mm length","Plastic Cable Ties",69.00,"Per 100",100],
  ["CT Colour 400mm","ct-colour-400mm","Assorted colour nylon cable tie, 400mm length","Plastic Cable Ties",72.00,"Per 100",100],
  ["CT Heavy Duty Black 400mm","ct-hd-black-400mm","Heavy duty black nylon cable tie, 400mm length","Plastic Cable Ties",99.00,"Per 100",100],
  ["CT Heavy Duty Colour 400mm","ct-hd-colour-400mm","Heavy duty assorted colour nylon cable tie, 400mm length","Plastic Cable Ties",105.00,"Per 100",100],
  ["CT Heavy Duty Black 500mm","ct-hd-black-500mm","Heavy duty black nylon cable tie, 500mm length","Plastic Cable Ties",119.00,"Per 100",100],
  ["CT Heavy Duty Colour 500mm","ct-hd-colour-500mm","Heavy duty assorted colour nylon cable tie, 500mm length","Plastic Cable Ties",125.00,"Per 100",100],
  ["CT Extra Heavy Duty Black 540mm","ct-ehd-black-540mm","Extra heavy duty black nylon cable tie, 540mm length","Plastic Cable Ties",149.00,"Per 100",100],
  ["CT Extra Heavy Duty Colour 540mm","ct-ehd-colour-540mm","Extra heavy duty assorted colour nylon cable tie, 540mm length","Plastic Cable Ties",159.00,"Per 100",100],
];

export async function GET() {
  const client = createClient({
    url: process.env.DATABASE_URL || "",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  let added = 0;
  for (const p of PRODUCTS) {
    const [name, slug, desc, cat, price, unit, minOrder] = p;
    const exist = await client.execute({ sql: "SELECT id FROM Product WHERE slug = ?", args: [slug] });
    if (exist.rows.length > 0) continue;
    await client.execute({
      sql: "INSERT INTO Product (name, slug, description, category, price, unit, minOrder, stock, isActive, imageUrl) VALUES (?,?,?,?,?,?,?,100,1,'')",
      args: [name, slug, desc, cat, price, unit, minOrder],
    });
    added++;
  }

  return NextResponse.json({ added, total: PRODUCTS.length });
}
