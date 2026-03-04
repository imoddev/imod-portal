import { PrismaClient } from "@prisma/client";
import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";

// Only run on server-side (not Edge)
let prisma: PrismaClient;

if (typeof window === "undefined" && process.env.NODE_ENV !== "edge") {
  const dbPath = process.cwd() + "/prisma/dev.db";
  const client = new Database(dbPath);
  const adapter = new PrismaBetterSQLite3(client);

  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
  };

  prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
}

export { prisma };
export default prisma!;
