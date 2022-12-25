import { Outlet } from "@remix-run/react";

import Header from "~/components/Header";

export default function AssignUsers() {
  return (
    <div className="flex h-full flex-col">
      <Header />
      <main className="m-4 h-full bg-white">
        <Outlet />
      </main>
    </div>
  );
}
