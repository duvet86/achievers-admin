import type { LoaderArgs } from "@remix-run/node";

import { authenticator } from "~/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  return await authenticator.authenticate("microsoft", request);
};
