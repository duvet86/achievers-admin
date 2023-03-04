import { useLoaderData, Link } from "@remix-run/react";

import { json } from "@remix-run/server-runtime";

import { getAzureUsersWithRolesAsync } from "~/services/azure.server";
import { getAssignedChaptersForUsersLookUpAsync } from "~/services/chapter.server";

import { ArrowUpTrayIcon, PencilIcon } from "@heroicons/react/24/solid";

import Title from "~/components/Title";

export async function loader() {
  const azureUsers = await getAzureUsersWithRolesAsync();

  const assignedChaptersLookUp = await getAssignedChaptersForUsersLookUpAsync(
    azureUsers.map(({ id }) => id)
  );

  return json({
    users: azureUsers
      .map((user) => ({
        ...user,
        email: user.mail ?? user.userPrincipalName,
        assignedChapters: assignedChaptersLookUp[user.id] ?? [],
      }))
      .sort((a, b) =>
        a.email.localeCompare(b.email, undefined, {
          sensitivity: "base",
        })
      ),
  });
}

export default function SelectChapter() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <Title>Users</Title>

      <div className="overflow-auto">
        <table className="table w-full">
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
            {data.users.map(
              ({ id, email, appRoleAssignments, assignedChapters }) => (
                <tr key={id}>
                  <td className="border p-2">{email}</td>
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
                  <td className="border p-2">
                    <Link
                      to={id}
                      className="btn-success btn-xs btn flex gap-2 align-middle"
                    >
                      Edit
                      <PencilIcon className="mr-4 h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-6 flex justify-end">
        <Link className="btn-primary btn gap-2" to="import-from-file">
          <ArrowUpTrayIcon className="h-6 w-6" />
          Import users from file
        </Link>
      </div>
    </>
  );
}
