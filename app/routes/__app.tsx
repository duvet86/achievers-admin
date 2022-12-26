import type { LoaderArgs } from "@remix-run/server-runtime";

import { Outlet } from "@remix-run/react";

import Header from "~/components/Header";
import { requireUserSession } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  await requireUserSession(request);

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
