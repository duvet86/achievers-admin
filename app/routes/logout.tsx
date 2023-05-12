import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "react-router";

import { isProduction } from "~/services";
import { authenticator_dev } from "~/services/session-dev.server";

export async function loader({ request }: LoaderArgs) {
  if (isProduction()) {
    const host =
      request.headers.get("X-Forwarded-Host") ?? request.headers.get("host");

    const url = new URL("/", `http://${host}`);

    return redirect(url.toString() + "/.auth/logout");
  } else {
    return await authenticator_dev.logout(request, { redirectTo: "/" });
  }
}
