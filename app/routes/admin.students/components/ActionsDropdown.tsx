import {
  DatabaseExport,
  DatabaseRestore,
  NavArrowDown,
  PasteClipboard,
} from "iconoir-react";

import { StateLink } from "~/components";

export function ActionsDropdown() {
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
          <StateLink className="gap-4" to="eois">
            <PasteClipboard />
            EOIs
          </StateLink>
        </li>
        <li>
          <StateLink className="gap-4" to="import">
            <DatabaseRestore />
            Import students
          </StateLink>
        </li>
        <li>
          <a className="gap-4" href="/admin/students/export" download>
            <DatabaseExport />
            Export students
          </a>
        </li>
      </ul>
    </div>
  );
}
