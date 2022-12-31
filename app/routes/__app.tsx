import type { LoaderArgs } from "@remix-run/server-runtime";

import { redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

import { getSessionUserAsync, logout } from "~/session.server";
import { Roles } from "~/models/azure.server";

import Header from "~/components/Header";

export async function loader({ request }: LoaderArgs) {
  const sessionUser = await getSessionUserAsync(request);

  if (!sessionUser) {
    return logout(request);
  }

  if (
    !sessionUser.appRoleAssignments
      .map(({ appRoleId }) => appRoleId)
      .includes(Roles.Admin)
  ) {
    throw redirect("/401");
  }

  return null;
}

export default function AppLayout() {
  return (
    <div className="flex h-full flex-col">
      <Header />
      <main className="m-4 h-full bg-white">
        <Outlet />
      </main>
    </div>
  );
}
