import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { __prisma?: PrismaClient };

// Created lazily so `next build` does not need DATABASE_URL.
function getClient(): PrismaClient {
  if (!globalForPrisma.__prisma) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    const adapter = new PrismaPg(new Pool({ connectionString }));
    globalForPrisma.__prisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.__prisma;
}

const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient();
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export default prisma;
