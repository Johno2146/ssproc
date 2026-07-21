const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  const products = await prisma.product.findMany();
  console.log("Total products:", products.length);
  console.log(products.map(p => p.name));
  process.exit(0);
}
main();
