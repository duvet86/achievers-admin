import {
  Key,
  NavArrowDown,
  WarningTriangle,
  BinFull,
  OnTag,
} from "iconoir-react";

import { StateLink, Title } from "~/components";

interface Props {
  endDate: Date | null;
  mentorAppRoleAssignmentId: string | null;
}

export function Header(props: Props) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:gap-10">
      <Title>Edit mentor info</Title>

      {getMessage(props)}

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
        <StateLink
          to="re-enable"
          relative="path"
          className="text-success gap-4 font-semibold"
        >
          <OnTag />
          Re enable mentor
        </StateLink>
      </li>
    );
  }

  if (mentorAppRoleAssignmentId !== null) {
    return (
      <>
        <li>
          <StateLink
            to="remove-access"
            className="text-warning gap-4 font-semibold"
          >
            <Key />
            Remove access
          </StateLink>
        </li>
        <li>
          <StateLink to="archive" className="text-error gap-4 font-semibold">
            <BinFull />
            Archive
          </StateLink>
        </li>
      </>
    );
  }

  return (
    <>
      <li>
        <StateLink
          to="give-access"
          className="text-success gap-4 font-semibold"
        >
          <Key />
          Give access
        </StateLink>
      </li>
      <li>
        <StateLink to="archive" className="text-error gap-4 font-semibold">
          <BinFull />
          Archive
        </StateLink>
      </li>
    </>
  );
}

function getMessage({ endDate, mentorAppRoleAssignmentId }: Props) {
  if (endDate !== null) {
    return (
      <p
        title="archived"
        className="bg-error flex items-center gap-4 rounded-sm px-6 py-2"
      >
        <WarningTriangle />
        This mentor is archived!{" "}
        <StateLink to="end-reason" className="link">
          View reason
        </StateLink>
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
