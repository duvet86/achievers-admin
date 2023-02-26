import { NavLink } from "@remix-run/react";

import ChevronRightIcon from "@heroicons/react/24/solid/ChevronRightIcon";

const links = [
  {
    value: "/users",
    label: "Users",
  },
  {
    value: "/chapters",
    label: "Chapters",
  },
];

export default function Drawer() {
  return (
    <div className="drawer-side">
      <label htmlFor="drawer" className="drawer-overlay"></label>
      <ul className="menu mt-16 w-80 border-r border-primary bg-base-200 p-4 text-base-content">
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
              <ChevronRightIcon className="h-6 w-6" />
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
