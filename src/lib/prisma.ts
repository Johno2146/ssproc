import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "";
  const tursoToken = process.env.TURSO_AUTH_TOKEN;
  
  // Use Turso/libsql adapter only when auth token is available
  if (tursoUrl && tursoToken && tursoUrl.startsWith("libsql://")) {
    const { PrismaLibSql } = require("@prisma/adapter-libsql");
    const { createClient } = require("@libsql/client");
    const libsql = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });
    const adapter = new PrismaLibSql(libsql);
    return new PrismaClient({ adapter });
  }
  
  // Fallback to SQLite (file-based, no adapter)
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;