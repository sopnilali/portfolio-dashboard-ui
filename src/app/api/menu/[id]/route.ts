import { api, readBody } from "@/server/lib/handler";
import { MenuService } from "@/server/modules/menu.service";

type P = { id: string };

export const GET = api<P>(async ({ params }) => ({
  message: "Menu fetched successfully",
  data: await MenuService.getSingleMenu(params.id),
}));

export const PATCH = api<P>(
  async ({ req, params }) => {
    const { body } = await readBody(req);
    return { message: "Menu updated successfully", data: await MenuService.updateMenu(params.id, { body }) };
  },
  { roles: ["Admin"] }
);

export const DELETE = api<P>(
  async ({ params }) => ({
    message: "Menu deleted successfully",
    data: await MenuService.deleteMenu(params.id),
  }),
  { roles: ["Admin"] }
);
