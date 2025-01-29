import { Link } from "react-router";

import { DatabaseExport, DatabaseRestore, NavArrowDown } from "iconoir-react";

export default function ActionsDropdown() {
  return (
    <div className="dropdown dropdown-end">
      <div title="actions" tabIndex={0} className="btn w-40 gap-2">
        Actions
        <NavArrowDown />
      </div>
      <ul
        tabIndex={0}
        className="menu dropdown-content rounded-box border-base-300 bg-base-100 w-52 border p-2 shadow-sm"
      >
        <li>
          <Link className="gap-4" to="import">
            <DatabaseRestore />
            Import mentors
          </Link>
        </li>
        <li>
          <a className="gap-4" href="/admin/users/export" download>
            <DatabaseExport />
            Export mentors
          </a>
        </li>
      </ul>
    </div>
  );
}
