// ===================================================================
// Prisma Client Singleton
// Next.js dev মোডে hot-reload এর কারণে বার বার নতুন PrismaClient তৈরি
// হয়ে যাওয়া ঠেকানোর জন্য এই pattern ব্যবহার করা হয় (Prisma-এর অফিসিয়াল সুপারিশ)
// ===================================================================
import prismaModule from "@prisma/client/wasm.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const { PrismaClient } = prismaModule as unknown as {
  PrismaClient: typeof import("@prisma/client").PrismaClient;
};

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined;
  pgPool: Pool | undefined;
};

function createPrismaClient(): InstanceType<typeof PrismaClient> {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.DIRECT_URL ||
    "postgresql://postgres:postgres@127.0.0.1:5432/postgres";

  const pool =
    globalForPrisma.pgPool ??
    new Pool({
      connectionString,
      ssl: connectionString.includes("localhost") || connectionString.includes("127.0.0.1")
        ? false
        : { rejectUnauthorized: false },
    });
  if (process.env.NODE_ENV !== "production") globalForPrisma.pgPool = pool;
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
