import { NavLink } from "@remix-run/react";

import {
  NavArrowRight,
  User,
  GraduationCap,
  Home,
  ShopFourTiles,
  Group,
  Calendar,
  PrivacyPolicy,
  Settings,
} from "iconoir-react";

interface Props {
  isAdmin: boolean;
}

interface DrawerLink {
  icon: JSX.Element | null;
  value: string;
  label: string;
}

function getLinks(isAdmin: boolean): DrawerLink[] {
  return isAdmin
    ? [
        {
          icon: <Home className="h-6 w-6" />,
          value: "/admin/home",
          label: "Home",
        },
        {
          icon: <User className="h-6 w-6" />,
          value: "/admin/users",
          label: "Mentors",
        },
        {
          icon: <GraduationCap className="h-6 w-6" />,
          value: "/admin/students",
          label: "Students",
        },
        {
          icon: <ShopFourTiles className="h-6 w-6" />,
          value: "/admin/chapters",
          label: "Chapters",
        },
        {
          icon: <Calendar className="h-6 w-6" />,
          value: "/admin/school-terms",
          label: "School Terms",
        },
        {
          icon: <Settings className="h-6 w-6" />,
          value: "/admin/config",
          label: "Config",
        },
      ]
    : [
        {
          icon: <Home className="h-6 w-6" />,
          value: "/mentor/home",
          label: "Home",
        },
        {
          icon: <GraduationCap className="h-6 w-6" />,
          value: "/mentor/students",
          label: "My Students (reports)",
        },
        {
          icon: <Group className="h-6 w-6" />,
          value: "/mentor/partner",
          label: "My Partner",
        },
        {
          icon: <Calendar className="h-6 w-6" />,
          value: "/mentor/roster",
          label: "Roster",
        },
        {
          icon: <PrivacyPolicy className="h-6 w-6" />,
          value: "/mentor/policy",
          label: "Policy",
        },
      ];
}

export function Drawer({ isAdmin }: Props) {
  const links = getLinks(isAdmin);

  return (
    <div className="drawer-side flex-col pt-16">
      <label
        htmlFor="drawer"
        aria-label="close sidebar"
        className="drawer-overlay"
      ></label>
      <ul className="menu h-full w-80 border-r border-primary bg-base-200 p-4 text-base-content">
        {links.map(({ icon, label, value }, index) => (
          <li key={index}>
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
              <NavArrowRight className="h-6 w-6" />
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
