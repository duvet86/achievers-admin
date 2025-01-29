import { Link, useSearchParams } from "react-router";

import {
  Key,
  NavArrowDown,
  WarningTriangle,
  BinFull,
  OnTag,
} from "iconoir-react";

import { Title } from "~/components";

interface Props {
  endDate: Date | null;
  mentorAppRoleAssignmentId: string | null;
}

export function Header(props: Props) {
  const [searchParams] = useSearchParams();

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:gap-10">
      <Title to={`/admin/users?${searchParams.toString()}`}>
        Edit mentor info
      </Title>

      {getMessage(props, searchParams)}

      <div className="flex-1"></div>

      <div className="dropdown dropdown-end">
        <div title="actions" tabIndex={0} className="btn w-full gap-2 sm:w-40">
          Actions
          <NavArrowDown />
        </div>
        <ul
          tabIndex={0}
          className="menu dropdown-content rounded-box border-base-300 bg-base-100 z-1 w-56 border p-2 shadow-sm"
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
          className="text-success gap-4 font-semibold"
        >
          <OnTag />
          Re enable mentor
        </Link>
      </li>
    );
  }

  if (mentorAppRoleAssignmentId !== null) {
    return (
      <li>
        <Link to="archive" className="text-error gap-4 font-semibold">
          <BinFull />
          Archive
        </Link>
      </li>
    );
  }

  return (
    <>
      <li>
        <Link to="give-access" className="text-success gap-4 font-semibold">
          <Key />
          Give access
        </Link>
      </li>
      <li>
        <Link to="archive" className="text-error gap-4 font-semibold">
          <BinFull />
          Archive
        </Link>
      </li>
    </>
  );
}

function getMessage(
  { endDate, mentorAppRoleAssignmentId }: Props,
  searchParams: URLSearchParams,
) {
  if (endDate !== null) {
    return (
      <p
        title="archived"
        className="bg-error flex items-center gap-4 rounded-sm px-6 py-2"
      >
        <WarningTriangle />
        This mentor is archived!{" "}
        <Link to={`end-reason?${searchParams}`} className="link">
          View reason
        </Link>
      </p>
    );
  }

  if (mentorAppRoleAssignmentId === null) {
    return (
      <p
        title="No access"
        className="bg-warning flex items-center gap-2 rounded-sm px-6 py-2"
      >
        <WarningTriangle />
        This mentor does NOT have access to the system!
      </p>
    );
  }
}
