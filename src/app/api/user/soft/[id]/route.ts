import { api } from "@/server/lib/handler";
import { UserService } from "@/server/modules/user.service";

export const DELETE = api<{ id: string }>(
  async ({ params }) => ({
    message: "User deleted successfully",
    data: await UserService.SoftdeleteUser(params.id),
  }),
  { roles: ["Admin"] }
);
