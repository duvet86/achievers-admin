import { useLoaderData, Link } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";

import { PencilIcon } from "@heroicons/react/24/solid";

import { getAzureUsersAsync } from "~/models/azure.server";
import { getAssignedChaptersForUsersLookUpAsync } from "~/models/chapter.server";

export async function loader() {
  const azureUsers = await getAzureUsersAsync();

  const assignedChaptersLookUp = await getAssignedChaptersForUsersLookUpAsync(
    azureUsers.map(({ id }) => id)
  );

  return json({
    users: azureUsers
      .map((user) => ({
        ...user,
        assignedChapters: assignedChaptersLookUp[user.id] ?? [],
      }))
      .sort((a, b) =>
        a.userPrincipalName.localeCompare(b.userPrincipalName, undefined, {
          sensitivity: "base",
        })
      ),
  });
}

export default function SelectChapter() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <h3 className="text-2xl font-bold">Users</h3>
      <div className="overflow-auto">
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th align="left" className="p-2">
                Username
              </th>
              <th align="left" className="p-2">
                Email
              </th>
              <th align="left" className="p-2">
                Role
              </th>
              <th align="left" className="p-2">
                Chapters
              </th>
              <th align="right" className="p-2">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {data.users.map(
              ({
                id,
                displayName,
                mail,
                appRoleAssignments,
                assignedChapters,
              }) => (
                <tr key={id}>
                  <td className="border p-2">{displayName}</td>
                  <td className="border p-2">{mail ?? "-"}</td>
                  <td className="border p-2">
                    {appRoleAssignments.length > 0 ? (
                      appRoleAssignments
                        .map(({ roleName }) => roleName)
                        .join(", ")
                    ) : (
                      <i className="text-sm">No roles assigned</i>
                    )}
                  </td>
                  <td className="border p-2">
                    {assignedChapters.length > 0 ? (
                      assignedChapters
                        .map(({ chapter: { name } }) => name)
                        .join(", ")
                    ) : (
                      <i className="text-sm">No chapters assigned</i>
                    )}
                  </td>
                  <td className="border p-2" align="right">
                    <Link to={id}>
                      <PencilIcon className="mr-4 w-6 text-blue-500" />
                    </Link>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
