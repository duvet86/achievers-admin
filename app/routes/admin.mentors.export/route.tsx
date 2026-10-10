import type { Route } from "./+types/route";

import {
  getLoggedUserInfoAsync,
  getPermissionsAbility,
} from "~/services/.server";

import { exportMentorsToSpreadsheetAsync } from "./services.server";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getLoggedUserInfoAsync(request);
  const buf = await exportMentorsToSpreadsheetAsync(
    getPermissionsAbility(user.roles),
    new URL(request.url).searchParams,
  );

  return new Response(buf, {
    status: 200,
    headers: new Headers({
      "Content-Disposition": 'attachment; filename="SheetJSNode.xlsx"',
      "Content-Type": "application/vnd.ms-excel",
    }),
  });
}
