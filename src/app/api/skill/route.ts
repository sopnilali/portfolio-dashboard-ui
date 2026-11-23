import { api, readBody } from "@/server/lib/handler";
import { SkillService } from "@/server/modules/skill.service";

export const POST = api(
  async ({ req }) => {
    const { body, file } = await readBody(req);
    return { message: "Skill created successfully", data: await SkillService.createSkill({ body, file }) };
  },
  { roles: ["Admin"] }
);

export const GET = api(async () => ({
  message: "Skill fetched successfully",
  data: await SkillService.getAllSkill(),
}));
