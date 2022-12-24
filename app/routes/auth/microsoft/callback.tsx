import type { LoaderArgs } from "@remix-run/node";

import { authenticator } from "~/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  try {
    return await authenticator.authenticate("microsoft", request, {
      successRedirect: "/",
      throwOnError: true,
    });
  } catch (error) {
    console.log(error);
  }
};
