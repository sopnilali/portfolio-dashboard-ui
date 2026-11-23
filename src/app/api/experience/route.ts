import { api, readBody } from "@/server/lib/handler";
import { ExperienceService } from "@/server/modules/experience.service";

export const POST = api(
  async ({ req }) => {
    const { body } = await readBody(req);
    return { message: "Experience created successfully", data: await ExperienceService.createExperience({ body }) };
  },
  { roles: ["Admin"] }
);

export const GET = api(async () => ({
  message: "Experiences fetched successfully",
  data: await ExperienceService.getAllExperience(),
}));
