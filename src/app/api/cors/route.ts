import { api, readBody } from "@/server/lib/handler";
import AppError from "@/server/lib/AppError";
import prisma from "@/server/lib/prisma";
import { generateApiKey } from "@/server/lib/apiKey";
import { envOrigins, invalidateCorsCache, normalizeOrigin } from "@/server/lib/cors";

// Allowed websites (database ones are editable, env ones are read-only)
export const GET = api(
  async () => {
    const rows = await prisma.corsOrigin.findMany({ orderBy: { createdAt: "asc" } });
    const dbOrigins = new Set(rows.map((r) => r.origin));
    const fromEnv = envOrigins()
      .filter((o) => !dbOrigins.has(o))
      .map((origin) => ({ id: `env:${origin}`, origin, note: "Set in CORS_ORIGINS env", source: "env", createdAt: null }));

    return {
      message: "Allowed origins fetched",
      data: [
        ...rows.map(({ apiKeyHash, ...r }) => ({ ...r, hasKey: Boolean(apiKeyHash), source: "database" })),
        ...fromEnv,
      ],
    };
  },
  { roles: ["Admin"] }
);

export const POST = api(
  async ({ req }) => {
    const { body } = await readBody(req);
    const origin = normalizeOrigin(String(body?.origin ?? ""));
    if (!origin) {
      throw new AppError(400, "Enter a full website address like https://example.com");
    }

    const note = typeof body?.note === "string" && body.note.trim() ? body.note.trim().slice(0, 120) : null;
    const { key, hash, preview } = generateApiKey();
    const { apiKeyHash, ...created } = await prisma.corsOrigin.create({
      data: { origin, note, apiKeyHash: hash, apiKeyPreview: preview },
    });
    invalidateCorsCache();

    // `apiKey` is returned this one time only; just its hash is stored.
    return { statusCode: 201, message: "Website allowed", data: { ...created, hasKey: true, apiKey: key, source: "database" } };
  },
  { roles: ["Admin"] }
);
