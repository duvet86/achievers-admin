import type { LoaderArgs } from "@remix-run/server-runtime";

import { json } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";

import { getSessionUserAsync, logout } from "~/session.server";
import { Roles } from "~/models/azure.server";

import Header from "~/components/Header";

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

  return json({
    sessionUser,
  });
}

export default function AppLayout() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex h-full flex-col">
      <Header sessionUser={data.sessionUser} />
      <main className="m-4 h-full bg-white">
        <Outlet />
      </main>
    </div>
  );
}
