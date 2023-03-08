import type { LoaderArgs } from "@remix-run/node";

import { authenticator } from "~/services";

export const loader = ({ request }: LoaderArgs) => {
  return authenticator.authenticate("microsoft", request, {
    successRedirect: "/",
    failureRedirect: "/401",
  });
};
