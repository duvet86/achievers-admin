import { Link } from "@remix-run/react";

export default function MobileDrawer() {
  return (
    <div className="drawer-side hidden lg:block">
      <label htmlFor="drawer" className="drawer-overlay"></label>
      <ul className="menu w-80 bg-base-100 p-4 text-base-content">
        <li>
          <Link to="/users">Users</Link>
        </li>
        <li>
          <Link to="/chapters">Chapters</Link>
        </li>
        <li>
          <Link to="/profile">Profile</Link>
        </li>
        <li>
          <Link to="/logout">Logout</Link>
        </li>
      </ul>
    </div>
  );
}
