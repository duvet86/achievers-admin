import type { LoaderFunctionArgs } from "react-router";

import { redirect } from "react-router";
import { Outlet } from "react-router";

import { isLoggedUserBlockedAsync, trackException } from "~/services/.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const isUserBlocked = await isLoggedUserBlockedAsync(request, "ConfigArea");

  if (isUserBlocked) {
    trackException(
      new Error(
        `Request url: ${request.url}. loggedUser has no ConfigArea permissions.`,
      ),
    );
    throw redirect("/403");
  }

  return null;
}

export default function Index() {
  return <Outlet />;
}
