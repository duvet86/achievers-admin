import type { LoaderArgs } from "@remix-run/server-runtime";

import { authenticator } from "~/services";

export async function loader({ request }: LoaderArgs) {
  await authenticator.logout(request, { redirectTo: "/" });
}
