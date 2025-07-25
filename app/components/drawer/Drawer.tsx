import type { JSX } from "react";

import { Link, NavLink } from "react-router";
import {
  NavArrowRight,
  User,
  GraduationCap,
  Home,
  ShopFourTiles,
  Group,
  Calendar,
  Page,
  Settings,
  StatsReport,
  RefreshDouble,
  TowerWarning,
  EditPencil,
  BubbleWarning,
  Archery,
  UserCircle,
} from "iconoir-react";

interface Props {
  currentView: string;
  linkMappings: Record<string, boolean>;
  isMentorAndAdmin: boolean;
}

interface DrawerLink {
  icon: JSX.Element | null;
  path: string;
  label: string;
  isVisible: boolean;
}

function getLinks(
  linkMappings: Record<string, boolean>,
  isAdmin: boolean,
): DrawerLink[] {
  return isAdmin
    ? [
        {
          icon: <Home />,
          path: "/admin/home",
          label: "Home",
          isVisible: true,
        },
        {
          icon: <User />,
          path: "/admin/mentors",
          label: "Mentors",
          isVisible: linkMappings.User,
        },
        {
          icon: <GraduationCap />,
          path: "/admin/students",
          label: "Students",
          isVisible: linkMappings.Student,
        },
        {
          icon: <StatsReport />,
          path: "/admin/sessions",
          label: "Reports",
          isVisible: linkMappings.Session,
        },
        {
          icon: <Archery />,
          path: "/admin/goals",
          label: "Goals",
          isVisible: linkMappings.Goals,
        },
        {
          icon: <ShopFourTiles />,
          path: "/admin/chapters",
          label: "Chapters",
          isVisible: linkMappings.Chapter,
        },
        {
          icon: <Calendar />,
          path: "/admin/school-terms",
          label: "School Terms",
          isVisible: linkMappings.SchoolTerm,
        },
        {
          icon: <Settings />,
          path: "/admin/config",
          label: "Config",
          isVisible: linkMappings.Config,
        },
        {
          icon: <TowerWarning />,
          path: "/admin/permissions",
          label: "Permissions",
          isVisible: linkMappings.Permissions,
        },
      ]
    : [
        {
          icon: <Home />,
          path: "/mentor/home",
          label: "Home",
          isVisible: true,
        },
        {
          icon: <Calendar />,
          path: "/mentor/roster",
          label: "Roster",
          isVisible: true,
        },
        {
          icon: <EditPencil />,
          path: "/mentor/write-report",
          label: "Write Report",
          isVisible: true,
        },
        {
          icon: <StatsReport />,
          path: "/mentor/view-reports",
          label: "View Reports",
          isVisible: true,
        },
        {
          icon: <GraduationCap />,
          path: "/mentor/students",
          label: "My Students",
          isVisible: true,
        },
        {
          icon: <Group />,
          path: "/mentor/partners",
          label: "My Partners",
          isVisible: true,
        },
        {
          icon: <Page />,
          path: "/mentor/useful-resources",
          label: "Useful Resources",
          isVisible: true,
        },
        {
          icon: <UserCircle />,
          path: "/mentor/profile",
          label: "Profile",
          isVisible: true,
        },
      ];
}

export function Drawer({ currentView, linkMappings, isMentorAndAdmin }: Props) {
  const isCurrentViewAdmin = currentView === "admin";
  const links = getLinks(linkMappings, isCurrentViewAdmin);

  const closeDrawer = () => {
    if (window.innerWidth <= 640) {
      document.getElementById("drawer-label")!.click();
    }
  };

  return (
    <div className="drawer-side z-20 pt-16">
      <label
        id="drawer-label"
        htmlFor="drawer"
        aria-label="close sidebar"
        className="drawer-overlay"
      ></label>

      <div className="flex h-full flex-col">
        <ul className="menu border-primary bg-base-200 text-base-content w-64 flex-1 border-r p-4">
          {links
            .filter(({ isVisible }) => isVisible)
            .map(({ icon, label, path: value }, index) => (
              <li key={index} onClick={closeDrawer}>
                <NavLink
                  to={value}
                  className={({ isActive }) =>
                    isActive
                      ? "mb-2 justify-between rounded-sm bg-black/20 font-semibold"
                      : "mb-2 justify-between rounded-sm font-semibold"
                  }
                >
                  <div className="flex items-center gap-4">
                    {icon}
                    {label}
                  </div>
                  <NavArrowRight />
                </NavLink>
              </li>
            ))}
        </ul>

        <ul className="menu border-primary bg-base-200 text-base-content w-64 border-t border-r p-4">
          <li>
            <button
              className="mb-2 justify-between rounded-sm font-semibold"
              onClick={() =>
                (
                  document.getElementById(
                    "report-error-modal",
                  ) as HTMLDialogElement
                ).showModal()
              }
            >
              <div className="flex items-center gap-4">
                <BubbleWarning className="text-secondary" />
                Feedback
              </div>
            </button>
          </li>
          {isMentorAndAdmin && (
            <li>
              <Link
                to={isCurrentViewAdmin ? "/mentor/home" : "/admin/home"}
                className="mb-2 justify-between rounded-sm font-semibold"
              >
                <div className="flex items-center gap-4">
                  <RefreshDouble />{" "}
                  {isCurrentViewAdmin ? "Mentor View" : "Admin View"}
                </div>
              </Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
