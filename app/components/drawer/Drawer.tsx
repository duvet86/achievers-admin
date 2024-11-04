import { Link, NavLink } from "@remix-run/react";
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
          path: "/admin/users",
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
          path: "/admin/student-sessions",
          label: "Reports",
          isVisible: linkMappings.Session,
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
          path: "/mentor/student-sessions",
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
      ];
}

export function Drawer({ currentView, linkMappings, isMentorAndAdmin }: Props) {
  const isCurrentViewAdmin = currentView === "admin";
  const links = getLinks(linkMappings, isCurrentViewAdmin);

  return (
    <div className="drawer-side z-20 pt-16">
      <label
        htmlFor="drawer"
        aria-label="close sidebar"
        className="drawer-overlay"
      ></label>
      <div className="flex h-full flex-col">
        <ul className="menu w-64 flex-1 border-r border-primary bg-base-200 p-4 text-base-content">
          {links
            .filter(({ isVisible }) => isVisible)
            .map(({ icon, label, path: value }, index) => (
              <li
                key={index}
                onClick={() => document.getElementById("drawer")!.click()}
              >
                <NavLink
                  to={value}
                  className={({ isActive }) =>
                    isActive
                      ? "active mb-2 justify-between rounded font-semibold"
                      : "mb-2 justify-between rounded font-semibold"
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
        <ul className="menu w-64 border-r border-t border-primary bg-base-200 p-4 text-base-content">
          <li>
            <button
              className="mb-2 justify-between rounded font-semibold"
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
                Report Error
              </div>
            </button>
          </li>
          {isMentorAndAdmin && (
            <li>
              <Link
                to={isCurrentViewAdmin ? "/mentor/home" : "/admin/home"}
                className="mb-2 justify-between rounded font-semibold"
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
