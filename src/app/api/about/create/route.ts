import { api, readBody } from "@/server/lib/handler";
import { aboutService } from "@/server/modules/about.service";

export const POST = api(
  async ({ req }) => {
    const { body, file } = await readBody(req);
    return { message: "About created successfully", data: await aboutService.createAboutfromDB({ body, file }) };
  },
  { roles: ["Admin"] }
);
