import { api, readBody } from "@/server/lib/handler";
import { BlogService } from "@/server/modules/blog.service";

export const POST = api(
  async ({ req, user }) => {
    const { body, file } = await readBody(req);
    return { message: "Blog created successfully", data: await BlogService.createBlog({ body, file, user }) };
  },
  { roles: ["Admin"] }
);
