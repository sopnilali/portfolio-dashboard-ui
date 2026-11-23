import { api, pick, queryObject, readBody } from "@/server/lib/handler";
import { UserService, userFilterableFields } from "@/server/modules/user.service";

// Public: register (same as the original server)
export const POST = api(async ({ req }) => {
  const { body, file } = await readBody(req);
  const result = await UserService.createUser({ body, file });
  return { statusCode: 201, message: "User Created Successfully!", data: result };
});

export const GET = api(
  async ({ req }) => {
    const query = queryObject(req);
    const filters = pick(query, userFilterableFields);
    const options = pick(query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await UserService.getAllUser(filters, options);
    return { message: "Users data fetched!", meta: result.meta, data: result.data };
  },
  { roles: ["Admin"] }
);
