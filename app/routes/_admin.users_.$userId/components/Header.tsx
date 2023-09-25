import { Link } from "@remix-run/react";

import {
  ArrowLeft,
  KeyAlt,
  NavArrowDown,
  WarningTriangle,
  BinFull,
} from "iconoir-react";

import { Title } from "~/components";

interface Props {
  endDate: string | null;
  mentorAppRoleAssignmentId: string | null;
}

export function Header(props: Props) {
  return (
    <div className="h-1/6">
      <div className="flex">
        <Link to="../" relative="path" className="btn btn-ghost mb-2 gap-2">
          <ArrowLeft className="w-6" />
          Back
        </Link>

        <div className="flex-1"></div>

        <div className="dropdown dropdown-end">
          <label title="actions" tabIndex={0} className="btn w-40 gap-2">
            Actions
            <NavArrowDown className="h-6 w-6" />
          </label>
          <ul
            tabIndex={0}
            className="menu dropdown-content rounded-box z-[1] w-56 border border-base-300 bg-base-100 p-2 shadow"
          >
            {getLinks(props)}
          </ul>
        </div>
      </div>

      <hr className="mb-4" />

      <div className="flex items-center gap-4">
        <Title>Edit mentor info</Title>

        {props.mentorAppRoleAssignmentId === null && (
          <p title="No access" className="mb-4 flex items-center gap-2">
            <WarningTriangle className="h-6 w-6 text-warning" />
            This mentor does NOT have access to the system.
          </p>
        )}
      </div>
    </div>
  );
}

function getLinks({ endDate, mentorAppRoleAssignmentId }: Props) {
  if (endDate !== null) {
    return (
      <li>
        <Link
          to="give-access"
          relative="path"
          className="gap-4 font-semibold text-success"
        >
          <KeyAlt className="h-6 w-6" />
          Re enable mentor
        </Link>
      </li>
    );
  }

  if (mentorAppRoleAssignmentId !== null) {
    return (
      <li>
        <Link to="./archive" className="gap-4 font-semibold text-error">
          <BinFull className="h-6 w-6" />
          Archive
        </Link>
      </li>
    );
  }

  return (
    <>
      <li>
        <Link
          to="give-access"
          relative="path"
          className="gap-4 font-semibold text-success"
        >
          <KeyAlt className="h-6 w-6" />
          Give access
        </Link>
      </li>
      <li>
        <Link to="./archive" className="gap-4 font-semibold text-error">
          <BinFull className="h-6 w-6" />
          Archive
        </Link>
      </li>
    </>
  );
}
