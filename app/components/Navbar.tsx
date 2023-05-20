import type { AzureUserWebAppWithRole, Environment } from "~/services";

import { Link } from "@remix-run/react";

import { ProfileCircle, Menu, LogOut } from "iconoir-react";

interface Props {
  currentUser: AzureUserWebAppWithRole;
  environment: Environment;
}

export function Navbar({ currentUser, environment }: Props) {
  const showEnvBadge = environment === "local" || environment === "staging";

  return (
    <nav className="navbar absolute left-0 top-0 h-16 bg-primary text-primary-content shadow-md">
      <div className="flex-none lg:hidden">
        <label htmlFor="drawer" className="btn-ghost btn-square btn">
          <Menu className="inline-block h-6 w-6 stroke-current" />
        </label>
      </div>
      <div className="flex-1">
        <Link to="/" className="btn-ghost btn text-xl normal-case">
          <img
            className="mr-4 w-16 rounded"
            src="/images/logo.png"
            alt="Logo"
          />
          <span className="text-xl font-semibold tracking-tight">
            Achievers WA
          </span>
          {showEnvBadge && (
            <span className="badge badge-lg ml-2">{environment}</span>
          )}
        </Link>
      </div>

      <div className="dropdown-end dropdown hidden lg:block">
        <div tabIndex={0} className="flex cursor-pointer items-center gap-2">
          <div className="font-semibold">{currentUser.email}</div>
          <label className="btn-ghost btn-circle btn">
            <div className="flex w-10 content-center justify-center rounded-full">
              <ProfileCircle />
            </div>
          </label>
        </div>
        <ul
          tabIndex={0}
          className="dropdown-content menu rounded-box w-52 bg-base-100 p-2 shadow"
        >
          <li>
            <Link className="font-semibold" to="/logout">
              <LogOut className="mr-2 w-6" />
              Logout
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
