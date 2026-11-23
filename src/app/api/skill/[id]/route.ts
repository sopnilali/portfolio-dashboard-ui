import { api, readBody } from "@/server/lib/handler";
import { SkillService } from "@/server/modules/skill.service";

type P = { id: string };

export const GET = api<P>(async ({ params }) => ({
  message: "Skill fetched successfully",
  data: await SkillService.getSingleSkill(params.id),
}));

export const PATCH = api<P>(
  async ({ req, params }) => {
    const { body, file } = await readBody(req);
    return {
      message: "Skill updated successfully",
      data: await SkillService.updateSkill(params.id, { body, file }),
    };
  },
  { roles: ["Admin"] }
);

export const DELETE = api<P>(
  async ({ params }) => ({
    message: "Skill deleted successfully",
    data: await SkillService.deleteSkill(params.id),
  }),
  { roles: ["Admin"] }
);
