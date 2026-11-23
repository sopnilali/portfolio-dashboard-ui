import { createHash, randomBytes } from "crypto";
import prisma from "./prisma";

export const API_KEY_HEADER = "x-api-key";

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

/** New random key. The plain text is shown once; only its hash is stored. */
export function generateApiKey() {
  const key = `pk_${randomBytes(32).toString("base64url")}`;
  return { key, hash: hashApiKey(key), preview: key.slice(-4) };
}

/** The allowed website a key belongs to, or null when the key is unknown. */
export async function findOriginByApiKey(key: string) {
  return prisma.corsOrigin.findUnique({ where: { apiKeyHash: hashApiKey(key) } });
}
