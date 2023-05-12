import type { LoaderArgs } from "@remix-run/node";

import { authenticator_dev } from "~/services/session-dev.server";

export const loader = async ({ request }: LoaderArgs) => {
  return await authenticator_dev.authenticate("microsoft", request, {
    successRedirect: "/",
    failureRedirect: "/error",
  });
};
