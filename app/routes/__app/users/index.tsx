import type { CreateUser } from "~/models/user.server";

import { useLoaderData, Link, Form, useActionData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";

import { PencilIcon } from "@heroicons/react/24/solid";

import { createManyUsers, getUsersAsync } from "~/models/user.server";
import {
  getAzureRolesAsync,
  getAzureUsersAsync,
  getAzureUsersLookUpAsync,
} from "~/models/azure.server";
import LoadingButton from "~/components/LoadingButton";

export async function loader() {
  const [users, azureUsers, roles] = await Promise.all([
    getUsersAsync(),
    getAzureUsersLookUpAsync(),
    getAzureRolesAsync(),
  ]);

  return json({
    users: users
      .map((u) => ({
        ...u,
        appRoleAssignments: azureUsers[u.azureObjectId].appRoleAssignments.map(
          ({ appRoleId }) => ({
            ...roles[appRoleId],
          })
        ),
      }))
      .sort((a, b) =>
        a.email.localeCompare(b.email, undefined, { sensitivity: "base" })
      ),
  });
}

export async function action() {
  const [users, azureUsers] = await Promise.all([
    getUsersAsync(),
    getAzureUsersAsync(),
  ]);

  const azureIds = users.map(({ azureObjectId }) => azureObjectId);

  const missingUsers = azureUsers
    .filter(({ id }) => !azureIds.includes(id))
    .map<CreateUser>(({ id, mail, userPrincipalName }) => ({
      azureObjectId: id,
      email: mail ?? userPrincipalName,
    }));

  if (missingUsers.length === 0) {
    return json({ message: "Up to date." });
  }

  await createManyUsers(missingUsers);

  return json({ message: `${missingUsers.length} users added.` });
}

export default function SelectChapter() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

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
                {appRoleAssignments.length > 0 ? (
                  appRoleAssignments
                    .map(({ displayName }) => displayName)
                    .join(", ")
                ) : (
                  <i className="text-sm">No roles assigned</i>
                )}
              </td>
              <td className="border p-2">
                {chapters.length > 0 ? (
                  chapters.map(({ chapter }) => chapter.name).join(", ")
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
          ))}
        </tbody>
      </table>
      <div className="flex flex-col items-end">
        <Form method="post">
          <LoadingButton className="mt-4" type="submit">
            Sync with Azure
          </LoadingButton>
          <p className="mt-2 text-green-700">{actionData?.message}</p>
        </Form>
      </div>
    </>
  );
}
