import type { LoaderFunctionArgs } from "@remix-run/node";

import { redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

import { isLoggedUserBlockedAsync } from "~/services/.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const isUserBlocked = await isLoggedUserBlockedAsync(request, "Config");

  if (isUserBlocked) {
    throw redirect("/403");
  }

  return null;
}

export default function Index() {
  return <Outlet />;
}
