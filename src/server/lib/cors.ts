import prisma from "./prisma";

const CACHE_MS = 30_000;
let cache: { origins: Set<string>; at: number } | null = null;

/** "https://Example.com/path?x=1" -> "https://example.com". Returns null for anything that is not http(s). */
export function normalizeOrigin(input: string): string | null {
  const value = input.trim();
  if (!value || value === "*") return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.origin.toLowerCase();
  } catch {
    return null;
  }
}

/** Origins from the CORS_ORIGINS env var (comma separated). Read-only fallback. */
export function envOrigins(): string[] {
  return (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map(normalizeOrigin)
    .filter((o): o is string => Boolean(o));
}

export function invalidateCorsCache() {
  cache = null;
}

/** Allowed origins = database list + env list, cached briefly. A database error never breaks requests. */
export async function getAllowedOrigins(): Promise<Set<string>> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.origins;

  const origins = new Set<string>(envOrigins());
  try {
    const rows = await prisma.corsOrigin.findMany({ select: { origin: true } });
    rows.forEach((r) => origins.add(r.origin));
  } catch (err) {
    console.error("Could not load CORS origins:", err);
  }
  cache = { origins, at: Date.now() };
  return origins;
}

export async function isOriginAllowed(origin: string): Promise<boolean> {
  const normalized = normalizeOrigin(origin);
  if (!normalized) return false;
  return (await getAllowedOrigins()).has(normalized);
}
