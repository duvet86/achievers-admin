import { Link } from "@remix-run/react";

import UserCircleIcon from "@heroicons/react/24/solid/UserCircleIcon";
import Bars3Icon from "@heroicons/react/24/solid/Bars3Icon";
import UserIcon from "@heroicons/react/24/solid/UserIcon";
import ArrowLeftOnRectangleIcon from "@heroicons/react/24/solid/ArrowLeftOnRectangleIcon";

interface Props {
  isAdmin: boolean;
}

export default function Navbar({ isAdmin }: Props) {
  return (
    <div className="navbar bg-primary text-primary-content">
      <div className="flex-none lg:hidden">
        <label htmlFor="drawer" className="btn-ghost btn-square btn">
          <Bars3Icon className="inline-block h-6 w-6 stroke-current" />
        </label>
      </div>
      <div className="flex-1">
        <Link
          to={isAdmin ? "/users" : "/roster"}
          className="btn-ghost btn text-xl normal-case"
        >
          <img
            className="mr-4 w-16 rounded"
            src="/images/logo.png"
            alt="Logo"
          />
          <span className="text-xl font-semibold tracking-tight">
            Achievers WA
          </span>
        </Link>
      </div>

      <div className="hidden flex-none lg:block">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link className="font-semibold" to="/users">
              Users
            </Link>
          </li>
          <li tabIndex={0}>
            <Link className="font-semibold" to="/chapters">
              Chapters
            </Link>
          </li>
        </ul>
      </div>
      <div className="dropdown-end dropdown hidden lg:block">
        <label tabIndex={0} className="btn-ghost btn-circle avatar btn">
          <div className="w-10 rounded-full">
            <UserCircleIcon />
          </div>
        </label>
        <ul
          tabIndex={0}
          className="dropdown-content menu rounded-box w-52 bg-base-100 p-2 shadow"
        >
          <li>
            <Link className="font-semibold" to="/profile">
              <UserIcon className="mr-2 w-6" />
              <span>Profile</span>
            </Link>
          </li>
          <li>
            <Link className="font-semibold" to="/logout">
              <ArrowLeftOnRectangleIcon className="mr-2 w-6" />
              <span>Logout</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
