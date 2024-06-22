import type { Environment } from "~/services";

import { Outlet } from "@remix-run/react";

import { Drawer } from "../drawer/Drawer";
import { Navbar } from "../navbar/Navbar";

interface Props {
  isAdmin: boolean;
  hasCompletedVolunteerAgreement?: boolean;
  version: string;
  userName: string;
  environment: Environment;
  linkMappings: Record<string, boolean>;
}

export function Body({
  userName,
  hasCompletedVolunteerAgreement,
  isAdmin,
  version,
  environment,
  linkMappings,
}: Props) {
  const showDrawer = isAdmin || hasCompletedVolunteerAgreement;

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

      {showDrawer && <Drawer isAdmin={isAdmin} linkMappings={linkMappings} />}
    </main>
  );
}
