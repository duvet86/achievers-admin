import type { LoaderArgs } from "@remix-run/node";

import { authenticator_dev } from "~/services/session-dev.server";

export async function loader({ request }: LoaderArgs) {
  return await authenticator_dev.logout(request, { redirectTo: "/" });
}
