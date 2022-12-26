import type { LoaderArgs } from "@remix-run/server-runtime";

import { logout } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  global.__accessToken__ = undefined;
  return logout(request);
}
