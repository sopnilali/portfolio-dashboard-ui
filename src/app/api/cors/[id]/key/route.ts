import { api } from "@/server/lib/handler";
import prisma from "@/server/lib/prisma";
import { generateApiKey } from "@/server/lib/apiKey";

// Make a new API key for a website. The old key stops working immediately.
export const POST = api<{ id: string }>(
  async ({ params }) => {
    const { key, hash, preview } = generateApiKey();
    await prisma.corsOrigin.update({
      where: { id: params.id },
      data: { apiKeyHash: hash, apiKeyPreview: preview },
    });
    return { message: "New API key created", data: { apiKey: key, apiKeyPreview: preview } };
  },
  { roles: ["Admin"] }
);
