import { api } from "@/server/lib/handler";
import { MenuService } from "@/server/modules/menu.service";

export const GET = api(
  async () => ({
    message: "Menus fetched successfully",
    data: await MenuService.getAllMenuAdmin(),
  }),
  { roles: ["Admin"] }
);
