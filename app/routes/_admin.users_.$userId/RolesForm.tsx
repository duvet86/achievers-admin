import type { SerializeFrom } from "@remix-run/node";
import type { loader } from "./index";

import { Link } from "@remix-run/react";

import { Cancel, MailOut } from "iconoir-react";

interface Props {
  loaderData: SerializeFrom<typeof loader>;
}

export function RolesForm({ loaderData: { azureUserInfo } }: Props) {
  return (
    <>
      <div className="overflow-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th align="left" className="p-2">
                Roles
              </th>
              <th align="right" className="w-3/12 p-2">
                Roles action
              </th>
            </tr>
          </thead>
          <tbody>
            {azureUserInfo === null && (
              <tr>
                <td colSpan={2} className="border p-2">
                  <i>Mentor hasn't been invited into the system yet</i>
                </td>
              </tr>
            )}
            {azureUserInfo?.appRoleAssignments.length === 0 && (
              <tr>
                <td colSpan={2} className="border p-2">
                  <i>No roles assigned to this user</i>
                </td>
              </tr>
            )}
            {azureUserInfo?.appRoleAssignments.map(({ id, roleName }) => (
              <tr key={id}>
                <td className="border p-2">
                  <span className="font-semibold">{roleName}</span>
                  <input type="hidden" name="roleIds" value={id} />
                </td>
                <td align="right" className="border p-2">
                  <Link
                    to={`roles/${id}/delete`}
                    className="btn-error btn-xs btn w-full gap-2"
                  >
                    <Cancel className="h-4 w-4" />
                    Remove
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="my-6 flex justify-end">
        {azureUserInfo === null && (
          <Link
            to="invite"
            relative="path"
            className="btn-primary btn w-64 gap-4"
          >
            <MailOut className="h-6 w-6" />
            Invite
          </Link>
        )}
      </div>
    </>
  );
}
