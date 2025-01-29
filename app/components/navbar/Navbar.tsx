import type { Environment } from "~/services";

import { Link } from "react-router";
import { ProfileCircle, Menu, LogOut, ClipboardCheck } from "iconoir-react";

import { Environments } from "~/services";

interface Props {
  currentView?: string;
  userName: string;
  environment: Environment;
  version: string;
}

export function Navbar({ userName, environment, version, currentView }: Props) {
  const isCurrentViewMentor = currentView === "mentor";
  const showEnvBadge =
    environment === Environments.Local || environment === Environments.Staging;

  return (
    <nav className="navbar bg-primary text-primary-content absolute top-0 left-0 z-30 h-16 justify-between shadow-md">
      <div className="flex">
        <div className="flex-none lg:hidden">
          <label htmlFor="drawer" className="btn btn-square btn-ghost">
            <Menu className="inline-block h-6 w-6 stroke-current" />
          </label>
        </div>
        <Link to="/" className="btn btn-ghost text-xl normal-case">
          {showEnvBadge ? (
            <span className="badge badge-lg ml-2">{environment}</span>
          ) : (
            <img
              className="mr-4 w-16 rounded-sm"
              src="/images/logo.png"
              alt="Logo"
            />
          )}
          <span className="hidden text-xl font-semibold tracking-tight sm:block">
            Achievers WA
          </span>
        </Link>
      </div>

      <div className="dropdown dropdown-end block">
        <div tabIndex={0} className="flex cursor-pointer items-center gap-2">
          <div className="hidden font-semibold lg:block">{userName}</div>
          <label className="btn btn-circle btn-ghost">
            <div className="flex w-10 content-center justify-center rounded-full">
              <ProfileCircle />
            </div>
          </label>
        </div>
        <ul
          tabIndex={0}
          className="menu dropdown-content rounded-box bg-base-100 w-64 p-2 shadow-sm"
        >
          {isCurrentViewMentor && (
            <li className="text-info">
              <Link className="font-semibold" to="/volunteer-agreement">
                <ClipboardCheck className="mr-2 w-6" />
                Volunteer Agreement
              </Link>
            </li>
          )}
          <li className="text-error">
            <Link className="font-semibold" to="/logout">
              <LogOut className="mr-2 w-6" />
              Logout
            </Link>
          </li>
          <li className="menu-title">
            <hr />
            <div className="mt-2 text-xs italic">Version {version}</div>
          </li>
        </ul>
      </div>
    </nav>
  );
}
