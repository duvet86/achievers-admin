import type { LoaderFunctionArgs } from "@remix-run/node";

import { redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

import { isLoggedUserBlockedAsync } from "~/services/.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const isUserBlocked = await isLoggedUserBlockedAsync(request, "Student");

  if (isUserBlocked) {
    throw redirect("/401");
  }

  return null;
}

export default function Index() {
  return <Outlet />;
}
