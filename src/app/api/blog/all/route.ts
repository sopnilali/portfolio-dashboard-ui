import { api } from "@/server/lib/handler";
import { BlogService } from "@/server/modules/blog.service";

export const GET = api(async () => ({
  message: "Blogs fetched successfully",
  data: await BlogService.getAllBlog(),
}));
