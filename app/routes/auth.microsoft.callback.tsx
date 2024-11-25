import { redirect, type LoaderFunctionArgs } from "@remix-run/node";

import { trackException } from "server-utils/azure-logger";

import {
  authenticator_dev,
  sessionStorage_dev,
} from "~/services/.server/session-dev.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const user = await authenticator_dev.authenticate("microsoft", request);

    const session = await sessionStorage_dev.getSession(
      request.headers.get("cookie"),
    );
    session.set("user", user);

    throw redirect("/", {
      headers: {
        "Set-Cookie": await sessionStorage_dev.commitSession(session),
      },
    });
  } catch (error) {
    trackException(error);

    throw error;
  }
};
