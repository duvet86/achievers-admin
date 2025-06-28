import React from "react";

import type { Environment } from "~/services";

import { Drawer } from "../drawer/Drawer";
import { Navbar } from "../navbar/Navbar";
import { FeedbackModal } from "../feeback-modal/FeedbackModal";

interface Props {
  currentView: string;
  isMentorAndAdmin: boolean;
  version: string;
  userName: string;
  environment: Environment;
  linkMappings: Record<string, boolean>;
  profilePicturePath?: string | null;
  children: React.ReactNode;
}

export function Body({
  userName,
  currentView,
  isMentorAndAdmin,
  version,
  environment,
  linkMappings,
  profilePicturePath,
  children,
}: Props) {
  return (
    <main className="drawer lg:drawer-open">
      <input id="drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col">
        <Navbar
          currentView={currentView}
          userName={userName}
          environment={environment}
          version={version}
          profilePicturePath={profilePicturePath}
        />
        <main className="content-main mt-16 flex flex-col overflow-y-auto p-4">
          {children}
        </main>
      </div>

      <Drawer
        currentView={currentView}
        isMentorAndAdmin={isMentorAndAdmin}
        linkMappings={linkMappings}
      />

      <FeedbackModal />
    </main>
  );
}
