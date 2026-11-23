import { api, readBody } from "@/server/lib/handler";
import { BlogService } from "@/server/modules/blog.service";

export const POST = api(
  async ({ req }) => {
    const { body, file } = await readBody(req, { editor: true });
    return { message: "Editor upload successfully", data: await BlogService.editorUpload({ body, file }) };
  },
  { roles: ["Admin"] }
);
