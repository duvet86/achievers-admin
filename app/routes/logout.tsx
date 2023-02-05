import type { LoaderArgs } from "@remix-run/server-runtime";

import { setAzureToken } from "~/services/azure-token.server";
import { logout } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  setAzureToken(undefined);

  return logout(request);
}
