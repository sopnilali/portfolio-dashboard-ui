import { api, readBody } from "@/server/lib/handler";
import { ContactService } from "@/server/modules/contact.service";

// public
export const POST = api(async ({ req }) => {
  const { body } = await readBody(req);
  return { message: "Contact created successfully", data: await ContactService.createContact({ body }) };
});

// public (same as the original server)
export const GET = api(async () => ({
  message: "Contacts fetched successfully",
  data: await ContactService.getAllContact(),
}));
