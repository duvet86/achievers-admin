import type { LoaderArgs } from "@remix-run/server-runtime";

import { json } from "@remix-run/server-runtime";
import { Outlet, useLoaderData } from "@remix-run/react";

import {
  getSessionUserAsync,
  getAzureUserWithRolesByIdAsync,
  Roles,
  version,
} from "~/services";

import Navbar from "~/components/Navbar";
import Drawer from "~/components/Drawer";

export async function loader({ request }: LoaderArgs) {
  const sessionUser = await getSessionUserAsync(request);

  const azureUser = await getAzureUserWithRolesByIdAsync(
    sessionUser.accessToken,
    sessionUser.userId
  );

  const sessionUserRoles = azureUser.appRoleAssignments.map(
    ({ appRoleId }) => appRoleId
  );

  const isAdmin = sessionUserRoles.includes(Roles.Admin);

  return json({
    isAdmin,
    azureUser,
    version,
  });
}

export default function AppLayout() {
  const { isAdmin, version, azureUser } = useLoaderData<typeof loader>();

  return (
    <div className="drawer-mobile drawer">
      <input id="drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <Navbar isAdmin={isAdmin} version={version} currentUser={azureUser} />

        <main className="mt-16 flex h-full flex-col overflow-y-auto bg-white p-4">
          <Outlet />
        </main>
      </div>
      <Drawer />
    </div>
  );
}
