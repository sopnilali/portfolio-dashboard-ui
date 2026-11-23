import { api } from "@/server/lib/handler";
import prisma from "@/server/lib/prisma";
import { invalidateCorsCache } from "@/server/lib/cors";

export const DELETE = api<{ id: string }>(
  async ({ params }) => {
    const removed = await prisma.corsOrigin.delete({ where: { id: params.id } });
    invalidateCorsCache();
    return { message: "Website removed", data: removed };
  },
  { roles: ["Admin"] }
);
