import type { Environment } from "~/services";

import { Outlet } from "@remix-run/react";

import { Drawer } from "../drawer/Drawer";
import { Navbar } from "../navbar/Navbar";

interface Props {
  currentView: string;
  isMentorAndAdmin: boolean;
  hasCompletedVolunteerAgreement?: boolean;
  version: string;
  userName: string;
  environment: Environment;
  linkMappings: Record<string, boolean>;
}

export function Body({
  userName,
  hasCompletedVolunteerAgreement,
  currentView,
  isMentorAndAdmin,
  version,
  environment,
  linkMappings,
}: Props) {
  const showDrawer = currentView === "admin" || hasCompletedVolunteerAgreement;

  return (
    <main className="drawer lg:drawer-open">
      <input id="drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <Navbar
          userName={userName}
          environment={environment}
          version={version}
        />

        <main className="content-main mt-16 flex flex-col overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>

      {showDrawer && (
        <Drawer
          currentView={currentView}
          isMentorAndAdmin={isMentorAndAdmin}
          linkMappings={linkMappings}
        />
      )}
    </main>
  );
}
