import { api, readBody } from "@/server/lib/handler";
import { UserService } from "@/server/modules/user.service";

type P = { id: string };

export const GET = api<P>(
  async ({ params }) => ({
    message: "User retrieved successfully",
    data: await UserService.getSingleUser(params.id),
  }),
  { roles: ["Admin", "User"] }
);

export const PATCH = api<P>(
  async ({ req, params }) => {
    const { body, file } = await readBody(req);
    return {
      message: "User updated successfully",
      data: await UserService.updateUser(params.id, { body, file }),
    };
  },
  { roles: ["Admin", "User"] }
);

export const DELETE = api<P>(
  async ({ params }) => ({
    message: "User deleted successfully",
    data: await UserService.deleteUser(params.id),
  }),
  { roles: ["Admin"] }
);
