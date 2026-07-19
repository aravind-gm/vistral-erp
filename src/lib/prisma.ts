import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const fallbackLocalDatabaseUrl = "postgresql://postgres@127.0.0.1:5445/vistral_erp";

function resolveConnectionString() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return fallbackLocalDatabaseUrl;
  }

  if (connectionString.includes("127.0.0.1:5435") || connectionString.includes("127.0.0.1:5433")) {
    return fallbackLocalDatabaseUrl;
  }

  return connectionString;
}

function createPrismaClient(): PrismaClient {
  const connectionString = resolveConnectionString();
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
