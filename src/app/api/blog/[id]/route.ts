import { api, readBody } from "@/server/lib/handler";
import { BlogService } from "@/server/modules/blog.service";

type P = { id: string };

export const GET = api<P>(async ({ params }) => ({
  message: "Blog fetched successfully",
  data: await BlogService.getSingleBlog(params.id),
}));

export const PATCH = api<P>(
  async ({ req, params }) => {
    const { body, file } = await readBody(req);
    return { message: "Blog updated successfully", data: await BlogService.updateBlog(params.id, { body, file }) };
  },
  { roles: ["Admin"] }
);

export const DELETE = api<P>(
  async ({ params }) => ({
    message: "Blog deleted successfully",
    data: await BlogService.deleteBlog(params.id),
  }),
  { roles: ["Admin"] }
);
