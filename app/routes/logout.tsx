import type { LoaderArgs } from "@remix-run/node";

import { authenticator } from "~/services";

export async function loader({ request }: LoaderArgs) {
  await authenticator.logout(request, { redirectTo: "/" });
}
