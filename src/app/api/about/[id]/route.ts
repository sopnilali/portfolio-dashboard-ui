import { api, readBody } from "@/server/lib/handler";
import { aboutService } from "@/server/modules/about.service";

export const PATCH = api<{ id: string }>(
  async ({ req, params }) => {
    const { body, file } = await readBody(req);
    return {
      message: "About updated successfully",
      data: await aboutService.updateAboutfromDB(params.id, { body, file }),
    };
  },
  { roles: ["Admin"] }
);
