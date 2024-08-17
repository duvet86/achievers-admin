import { Link, useSearchParams } from "@remix-run/react";

import {
  Key,
  NavArrowDown,
  WarningTriangle,
  BinFull,
  OnTag,
} from "iconoir-react";

import { Title } from "~/components";

interface Props {
  endDate: string | null;
  mentorAppRoleAssignmentId: string | null;
}

export function Header(props: Props) {
  const [searchParams] = useSearchParams();

  return (
    <div className="flex flex-col items-center gap-10 lg:flex-row">
      <Title to={`/admin/users?${searchParams.toString()}`}>
        Edit mentor info
      </Title>

      {getMessage(props)}

      <div className="flex-1"></div>

      <div className="dropdown dropdown-end">
        <div title="actions" tabIndex={0} className="btn w-40 gap-2">
          Actions
          <NavArrowDown className="h-6 w-6" />
        </div>
        <ul
          tabIndex={0}
          className="menu dropdown-content z-[1] w-56 rounded-box border border-base-300 bg-base-100 p-2 shadow"
        >
          {getLinks(props)}
        </ul>
      </div>
    </div>
  );
}

function getLinks({ endDate, mentorAppRoleAssignmentId }: Props) {
  if (endDate !== null) {
    return (
      <li>
        <Link
          to="re-enable"
          relative="path"
          className="gap-4 font-semibold text-success"
        >
          <OnTag className="h-6 w-6" />
          Re enable mentor
        </Link>
      </li>
    );
  }

  if (mentorAppRoleAssignmentId !== null) {
    return (
      <li>
        <Link to="archive" className="gap-4 font-semibold text-error">
          <BinFull className="h-6 w-6" />
          Archive
        </Link>
      </li>
    );
  }

  return (
    <>
      <li>
        <Link to="give-access" className="gap-4 font-semibold text-success">
          <Key className="h-6 w-6" />
          Give access
        </Link>
      </li>
      <li>
        <Link to="archive" className="gap-4 font-semibold text-error">
          <BinFull className="h-6 w-6" />
          Archive
        </Link>
      </li>
    </>
  );
}

function getMessage({ endDate, mentorAppRoleAssignmentId }: Props) {
  if (endDate !== null) {
    return (
      <p
        title="archived"
        className="flex items-center gap-2 rounded bg-error px-6 py-2"
      >
        <WarningTriangle className="h-6 w-6" />
        This mentor is archived!
      </p>
    );
  }

  if (mentorAppRoleAssignmentId === null) {
    return (
      <p
        title="No access"
        className="flex items-center gap-2 rounded bg-warning px-6 py-2"
      >
        <WarningTriangle className="h-6 w-6" />
        This mentor does NOT have access to the system!
      </p>
    );
  }
}
