import { api } from "@/server/lib/handler";
import { aboutService } from "@/server/modules/about.service";

export const GET = api(async () => ({
  message: "About fetched successfully",
  data: await aboutService.GetAllAboutfromDB(),
}));
