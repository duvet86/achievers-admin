import type { LoaderArgs } from "@remix-run/server-runtime";

import { json } from "@remix-run/server-runtime";
import { Outlet, useLoaderData } from "@remix-run/react";

import { getSessionUserAsync, logout } from "~/session.server";
import { Roles } from "~/services/azure.server";

import Navbar from "~/components/Navbar";
import Drawer from "~/components/Drawer";

import { version } from "~/services/version.server";

export async function loader({ request }: LoaderArgs) {
  const sessionUser = await getSessionUserAsync(request);

  if (sessionUser === undefined) {
    return logout(request);
  }

  const sessionUserRoles = sessionUser.appRoleAssignments.map(
    ({ appRoleId }) => appRoleId
  );

  const isAdmin = sessionUserRoles.includes(Roles.Admin);

  return json({
    isAdmin,
    sessionUser,
    version,
  });
}

export default function AppLayout() {
  const { isAdmin, version, sessionUser } = useLoaderData<typeof loader>();

  return (
    <div className="drawer-mobile drawer">
      <input id="drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <Navbar isAdmin={isAdmin} version={version} sessionUser={sessionUser} />

        <main className="mt-16 flex h-full flex-col overflow-y-auto bg-white p-4">
          <Outlet />
        </main>
      </div>
      <Drawer />
    </div>
  );
}
