import type { LoaderArgs } from "@remix-run/server-runtime";

import { json } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";

import { getSessionUserAsync, logout } from "~/session.server";
import { Roles } from "~/services/azure.server";

import Navbar from "~/components/Navbar";
import Drawer from "~/components/Drawer";

export async function loader({ request }: LoaderArgs) {
  const sessionUser = await getSessionUserAsync(request);

  if (!sessionUser) {
    return logout(request);
  }

  const sessionUserRoles = sessionUser.appRoleAssignments.map(
    ({ appRoleId }) => appRoleId
  );

  if (sessionUserRoles.includes(Roles.Student)) {
    throw redirect("/401");
  }

  const isAdmin = sessionUserRoles.includes(Roles.Admin);

  return json({
    isAdmin,
  });
}

export default function AppLayout() {
  const { isAdmin } = useLoaderData<typeof loader>();

  return (
    <div className="drawer drawer-mobile">
      <input id="drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <Navbar isAdmin={isAdmin} />

        <main className="mt-16 flex h-full flex-col overflow-y-auto bg-white p-4">
          <Outlet />
        </main>
      </div>
      <Drawer />
    </div>
  );
}
