import type { LoaderFunctionArgs } from "@remix-run/node";

import { authenticator_dev } from "~/services/.server/session-dev.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return await authenticator_dev.authenticate("microsoft", request);
};
