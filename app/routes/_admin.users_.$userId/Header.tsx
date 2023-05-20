import { Link } from "@remix-run/react";

import {
  ArrowLeft,
  Cancel,
  MailOut,
  NavArrowDown,
  WarningTriangle,
} from "iconoir-react";

import { Title } from "~/components";

interface Props {
  mentorAppRoleAssignmentId: string | null;
}

export default function Header({ mentorAppRoleAssignmentId }: Props) {
  return (
    <>
      <div className="flex">
        <Link to="../" relative="path" className="btn-ghost btn mb-2 gap-2">
          <ArrowLeft className="w-6" />
          Back
        </Link>

        <div className="flex-1"></div>

        <div className="dropdown-end dropdown">
          <label title="actions" tabIndex={0} className="btn w-40 gap-2">
            Actions
            <NavArrowDown className="h-6 w-6" />
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu rounded-box w-56 bg-base-100 p-2 shadow"
          >
            <li>
              {mentorAppRoleAssignmentId === null ? (
                <Link
                  to="give-access"
                  relative="path"
                  className="gap-4 font-semibold uppercase text-success"
                >
                  <MailOut className="h-6 w-6" />
                  Give access
                </Link>
              ) : (
                <Link
                  to={`revoke-access/${mentorAppRoleAssignmentId}`}
                  relative="path"
                  className="gap-4 font-semibold uppercase text-error"
                >
                  <Cancel className="h-6 w-6" />
                  Archive mentor
                </Link>
              )}
            </li>
          </ul>
        </div>
      </div>

      <hr className="mb-4" />

      <div className="flex items-center gap-4">
        <Title>Edit mentor info</Title>

        {mentorAppRoleAssignmentId === null && (
          <p title="No access" className="mb-4 flex items-center gap-2">
            <WarningTriangle className="h-6 w-6 text-warning" />
            This mentor does NOT have access to the system.
          </p>
        )}
      </div>
    </>
  );
}
