import { api, readBody } from "@/server/lib/handler";
import { ExperienceService } from "@/server/modules/experience.service";

type P = { id: string };

export const PATCH = api<P>(
  async ({ req, params }) => {
    const { body } = await readBody(req);
    return {
      message: "Experience updated successfully",
      data: await ExperienceService.updateExperience(params.id, { body }),
    };
  },
  { roles: ["Admin"] }
);

export const DELETE = api<P>(
  async ({ params }) => ({
    message: "Experience deleted successfully",
    data: await ExperienceService.deleteExperience(params.id),
  }),
  { roles: ["Admin"] }
);
