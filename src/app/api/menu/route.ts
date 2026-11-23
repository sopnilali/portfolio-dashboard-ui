import { api, readBody } from "@/server/lib/handler";
import { MenuService } from "@/server/modules/menu.service";

export const POST = api(
  async ({ req }) => {
    const { body } = await readBody(req);
    return { message: "Menu created successfully", data: await MenuService.createMenu({ body }) };
  },
  { roles: ["Admin"] }
);

export const GET = api(async () => ({
  message: "Menus fetched successfully",
  data: await MenuService.getAllMenu(),
}));
