import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "react-router";

import { getCurrentHost, isProduction } from "~/services";
import { authenticator_dev } from "~/services/session-dev.server";

export async function loader({ request }: LoaderArgs) {
  if (isProduction()) {
    return redirect(
      getCurrentHost(request) + "/.auth/logout?post_logout_redirect_uri=/"
    );
  } else {
    return await authenticator_dev.logout(request, { redirectTo: "/" });
  }
}
