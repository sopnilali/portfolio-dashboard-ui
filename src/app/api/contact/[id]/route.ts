import { api, readBody } from "@/server/lib/handler";
import { ContactService } from "@/server/modules/contact.service";

type P = { id: string };

const update = api<P>(
  async ({ req, params }) => {
    const { body } = await readBody(req);
    return {
      message: "Contact updated successfully",
      data: await ContactService.updateContact(params.id, { body }),
    };
  },
  { roles: ["Admin"] }
);

// original server used PUT; PATCH accepted too
export const PUT = update;
export const PATCH = update;

export const DELETE = api<P>(
  async ({ params }) => ({
    message: "Contact deleted successfully",
    data: await ContactService.deleteContact(params.id),
  }),
  { roles: ["Admin"] }
);
