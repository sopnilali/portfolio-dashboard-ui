import { api, readBody } from "@/server/lib/handler";
import { ProjectService } from "@/server/modules/project.service";

type P = { id: string };

export const GET = api<P>(async ({ params }) => ({
  message: "Project fetched successfully",
  data: await ProjectService.getSingleProject(params.id),
}));

export const PATCH = api<P>(
  async ({ req, params }) => {
    const { body, file } = await readBody(req);
    return {
      message: "Project updated successfully",
      data: await ProjectService.updateProject(params.id, { body, file }),
    };
  },
  { roles: ["Admin"] }
);

export const DELETE = api<P>(
  async ({ params }) => ({
    message: "Project deleted successfully",
    data: await ProjectService.deleteProject(params.id),
  }),
  { roles: ["Admin"] }
);
