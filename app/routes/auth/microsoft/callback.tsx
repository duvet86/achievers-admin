import type { LoaderArgs } from "@remix-run/node";

import { authenticator } from "~/session.server";

export const loader = ({ request }: LoaderArgs) => {
  return authenticator.authenticate("microsoft", request, {
    successRedirect: "/",
    failureRedirect: "/error",
  });
};
