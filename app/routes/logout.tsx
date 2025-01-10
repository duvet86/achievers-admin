import type { LoaderFunctionArgs } from "react-router";
import type { TokenInfo } from "~/services";

import { redirect } from "react-router";

import { getCurrentHost, isProduction } from "~/services";
import {
  sessionStorage_dev,
  strategy_dev,
} from "~/services/.server/session-dev.server";

export async function loader({ request }: LoaderFunctionArgs) {
  if (isProduction()) {
    return redirect(
      getCurrentHost(request) + "/.auth/logout?post_logout_redirect_uri=/",
    );
  } else {
    const session = await sessionStorage_dev.getSession(
      request.headers.get("cookie"),
    );

    const user = session.get("user") as TokenInfo | undefined;

    await strategy_dev.revokeToken(user!.accessToken);

    return redirect("/", {
      headers: {
        "Set-Cookie": await sessionStorage_dev.destroySession(session),
      },
    });
  }
}
