import type { LoaderArgs } from "@remix-run/server-runtime";

import { json } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";

import { getSessionUserAsync, logout } from "~/session.server";
import { Roles } from "~/models/azure.server";

import Navbar from "~/components/Navbar";
import MobileDrawer from "~/components/MobileDrawer";

export async function loader({ request }: LoaderArgs) {
  const sessionUser = await getSessionUserAsync(request);

  if (!sessionUser) {
    return logout(request);
  }

  if (
    sessionUser.appRoleAssignments
      .map(({ appRoleId }) => appRoleId)
      .includes(Roles.Student)
  ) {
    throw redirect("/401");
  }

  const isAdmin = sessionUser.appRoleAssignments
    .map(({ appRoleId }) => appRoleId)
    .includes("e567add0-fec3-4c87-941a-05dd2e18cdfd");

  return json({
    isAdmin,
  });
}

export default function AppLayout() {
  const { isAdmin } = useLoaderData<typeof loader>();

  return (
    <div className="drawer">
      <input id="drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <Navbar isAdmin={isAdmin} />
        <main className="m-4 h-full bg-white">
          <Outlet />
        </main>
      </div>
      <MobileDrawer />
    </div>
  );
}
