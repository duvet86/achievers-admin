import { NavLink } from "@remix-run/react";

import { NavArrowRight, User, GraduationCap, Home } from "iconoir-react";

interface Props {
  isAdmin: boolean;
  version: string;
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
          icon: <User className="h-6 w-6" />,
          value: "/users",
          label: "Mentors",
        },
        {
          icon: <GraduationCap className="h-6 w-6" />,
          value: "/students",
          label: "Students",
        },
        {
          icon: <Home className="h-6 w-6" />,
          value: "/chapters",
          label: "Chapters",
        },
      ]
    : [
        {
          icon: null,
          value: "/roster",
          label: "Roster",
        },
        {
          icon: null,
          value: "/mentees",
          label: "My Mentees",
        },
      ];
}

export function Drawer({ isAdmin, version }: Props) {
  const links = getLinks(isAdmin);

  return (
    <div className="drawer-side pt-16">
      <label htmlFor="drawer" className="drawer-overlay"></label>
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
      <div
        data-testid="version"
        className="absolute bottom-0 left-2 z-10 text-sm italic"
      >
        Version {version}
      </div>
    </div>
  );
}
