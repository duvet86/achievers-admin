import type { LoaderFunctionArgs } from "@remix-run/node";

import { redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

import { isLoggedUserBlockedAsync, trackException } from "~/services/.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const isUserBlocked = await isLoggedUserBlockedAsync(request, "UserArea");

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
