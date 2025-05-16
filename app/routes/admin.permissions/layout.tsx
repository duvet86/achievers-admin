import type { Route } from "./+types/route";

import { redirect } from "react-router";
import { Outlet } from "react-router";

import { isLoggedUserBlockedAsync, trackException } from "~/services/.server";

export async function loader({ request }: Route.LoaderArgs) {
  const isUserBlocked = await isLoggedUserBlockedAsync(
    request,
    "PermissionsArea",
  );

  if (isUserBlocked) {
    trackException(
      new Error(
        `Request url: ${request.url}. loggedUser has no UserArea permissions.`,
      ),
    );
    throw redirect("/403");
  }

  return null;
}

export default function Index() {
  return <Outlet />;
}
