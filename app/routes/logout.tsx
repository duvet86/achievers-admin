import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "react-router";

import { getCurrentHost, isProduction } from "~/services";
import { sessionStorage_dev } from "~/services/.server/session-dev.server";

export async function loader({ request }: LoaderFunctionArgs) {
  if (isProduction()) {
    return redirect(
      getCurrentHost(request) + "/.auth/logout?post_logout_redirect_uri=/",
    );
  } else {
    const session = await sessionStorage_dev.getSession(
      request.headers.get("cookie"),
    );

    return redirect("/", {
      headers: {
        "Set-Cookie": await sessionStorage_dev.destroySession(session),
      },
    });
  }
}
