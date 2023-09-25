import type { AzureUserWebAppWithRole, Environment } from "~/services";

import { Outlet } from "@remix-run/react";

import { Drawer } from "./Drawer";
import { Navbar } from "./Navbar";

interface Props {
  isAdmin: boolean;
  hasCompletedVolunteerAgreement?: boolean;
  version: string;
  currentUser: AzureUserWebAppWithRole;
  environment: Environment;
}

export function Body({
  currentUser,
  hasCompletedVolunteerAgreement,
  isAdmin,
  version,
  environment,
}: Props) {
  const showDrawer = isAdmin || hasCompletedVolunteerAgreement;

  return (
    <div className="drawer lg:drawer-open">
      <input id="drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex h-screen flex-col">
        <Navbar currentUser={currentUser} environment={environment} />

        <main className="bg-preview mt-16 flex h-full flex-col overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>

      {showDrawer && <Drawer isAdmin={isAdmin} version={version} />}
    </div>
  );
}
