import { redirect, type LoaderFunctionArgs } from "react-router";

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    trackException(error as any);

    throw error;
  }
};
