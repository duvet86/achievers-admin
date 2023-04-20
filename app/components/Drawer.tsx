import { NavLink } from "@remix-run/react";

import { NavArrowRight } from "iconoir-react";

interface Props {
  isAdmin: boolean;
  version: string;
}

function getLinks(isAdmin: boolean) {
  return isAdmin
    ? [
        {
          value: "/users",
          label: "Users",
        },
        {
          value: "/chapters",
          label: "Chapters",
        },
      ]
    : [
        {
          value: "/roster",
          label: "Roster",
        },
        {
          value: "/mentees",
          label: "My Mentees",
        },
      ];
}

export function Drawer({ isAdmin, version }: Props) {
  const links = getLinks(isAdmin);

  return (
    <div className="drawer-side relative mt-16">
      <label htmlFor="drawer" className="drawer-overlay"></label>
      <ul className="menu w-80 border-r border-primary bg-base-200 p-4 text-base-content">
        {links.map(({ label, value }, index) => (
          <li key={index}>
            <NavLink
              to={value}
              className={({ isActive }) =>
                isActive
                  ? "mb-2 justify-between rounded bg-primary font-semibold"
                  : "mb-2 justify-between rounded bg-base-300 font-semibold"
              }
            >
              {label}
              <NavArrowRight className="h-6 w-6" />
            </NavLink>
          </li>
        ))}
      </ul>
      <div
        data-testid="version"
        className="absolute bottom-0 right-2 z-10 text-sm italic"
      >
        Version {version}
      </div>
    </div>
  );
}
