import { useLoaderData, Link } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";

import { PencilIcon } from "@heroicons/react/24/solid";

import { getUsersAsync } from "~/models/user.server";
import { getAzureRolesAsync, getAzureUsersAsync } from "~/models/azure.server";

export async function loader() {
  const [users, azureUsers, roles] = await Promise.all([
    getUsersAsync(),
    getAzureUsersAsync(),
    getAzureRolesAsync(),
  ]);

  return json({
    users: users.map((u) => ({
      ...u,
      appRoleAssignments: azureUsers[u.azureObjectId].appRoleAssignments.map(
        ({ appRoleId }) => ({
          ...roles[appRoleId],
        })
      ),
    })),
  });
}

export default function SelectChapter() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <h3 className="text-2xl font-bold">Users</h3>
      <table className="w-full table-auto">
        <thead>
          <tr>
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
          {data.users.map(({ id, email, appRoleAssignments, chapters }) => (
            <tr key={id}>
              <td className="border p-2">{email}</td>
              <td className="border p-2">
                {appRoleAssignments
                  .map(({ displayName }) => displayName)
                  .join(", ")}
              </td>
              <td className="border p-2">
                {chapters.length > 0
                  ? chapters.map(({ chapter }) => chapter.name).join(", ")
                  : "-"}
              </td>
              <td className="border p-2" align="right">
                <Link to={id}>
                  <PencilIcon className="mr-4 w-6 text-blue-500" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
