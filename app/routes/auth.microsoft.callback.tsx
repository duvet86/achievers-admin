import type { LoaderArgs } from "@remix-run/node";

import { authenticator, trackException } from "~/services";

export const loader = async ({ request }: LoaderArgs) => {
  try {
    return await authenticator.authenticate("microsoft", request, {
      successRedirect: "/",
      failureRedirect: "/401",
    });
  } catch (response) {
    if (response instanceof Response) {
      return response;
    } else {
      trackException({
        exception: response as Error,
      });

      return await authenticator.logout(request, {
        redirectTo: "/auth/microsoft",
      });
    }
  }
};
