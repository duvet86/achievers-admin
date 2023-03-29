import type { AzureUserWebAppWithRole } from "~/services";

import { Outlet } from "@remix-run/react";

import { Drawer } from "./Drawer";
import { Navbar } from "./Navbar";

interface Props {
  isAdmin: boolean;
  hasCompletedVolunteerAgreement?: boolean;
  version: string;
  currentUser: AzureUserWebAppWithRole;
}

export function Body({
  currentUser,
  hasCompletedVolunteerAgreement,
  isAdmin,
  version,
}: Props) {
  const showDrawer = isAdmin || hasCompletedVolunteerAgreement;

  return (
    <div className="drawer-mobile drawer">
      <input id="drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <Navbar currentUser={currentUser} />

        <main className="mt-16 flex h-full flex-col overflow-y-auto bg-white p-4">
          <Outlet />
        </main>
      </div>

      {showDrawer && <Drawer isAdmin={isAdmin} version={version} />}
    </div>
  );
}
