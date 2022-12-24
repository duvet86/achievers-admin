import type { LoaderArgs } from "@remix-run/node";

import { authenticator } from "~/services/auth.server";

export const loader = ({ request }: LoaderArgs) => {
  return authenticator.authenticate("microsoft", request, {
    successRedirect: "/",
    failureRedirect: "/login",
    throwOnError: true,
  });
};
