import { api, readBody } from "@/server/lib/handler";
import { ProjectService } from "@/server/modules/project.service";

export const POST = api(
  async ({ req }) => {
    const { body, file } = await readBody(req);
    return { message: "Project created successfully", data: await ProjectService.createProject({ body, file }) };
  },
  { roles: ["Admin"] }
);

export const GET = api(async () => ({
  message: "Project fetched successfully",
  data: await ProjectService.getAllProject(),
}));
