import { Link } from "@remix-run/react";
import { BinFull, NavArrowDown, OnTag, WarningTriangle } from "iconoir-react";

import { Title } from "~/components";

interface Props {
  title: string;
  endDate: string | null | undefined;
}

export function Header({ title, endDate }: Props) {
  return (
    <div className="flex flex-col items-center gap-4 lg:flex-row">
      <Title to="/admin/students">{title}</Title>

      {endDate && (
        <p
          title="archived"
          className="mb-4 flex items-center gap-2 rounded bg-error px-6 py-2"
        >
          <WarningTriangle className="h-6 w-6" />
          This student is archived!
        </p>
      )}

      <div className="flex-1"></div>

      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn w-40 gap-2">
          Actions
          <NavArrowDown className="h-6 w-6" />
        </div>
        <ul
          tabIndex={0}
          className="menu dropdown-content w-52 rounded-box border border-base-300 bg-base-100 p-2 shadow"
        >
          {endDate ? (
            <li>
              <Link
                to="re-enable"
                relative="path"
                className="gap-4 font-semibold text-success"
              >
                <OnTag className="h-6 w-6" />
                Re enable student
              </Link>
            </li>
          ) : (
            <li>
              <Link to="archive" className="gap-4 font-semibold text-error">
                <BinFull className="h-6 w-6" />
                Archive
              </Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
