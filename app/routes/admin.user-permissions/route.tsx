import type { LoaderFunctionArgs } from "@remix-run/node";

import { useLoaderData, Link } from "@remix-run/react";
import { json } from "@remix-run/node";
import { PageEdit } from "iconoir-react";

import { getAzureUsersWithRolesAsync } from "~/services/.server";
import { Title } from "~/components";

import { getChaptersLookupAsync, getRoleMappings } from "./services.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const chaptersLookup = await getChaptersLookupAsync();
  const users = await getAzureUsersWithRolesAsync(request);

  const admins = users
    .filter(
      ({ appRoleAssignments }) =>
        appRoleAssignments.length > 0 &&
        !appRoleAssignments.map(({ roleName }) => roleName).includes("Mentor"),
    )
    .map((user) => ({
      ...user,
      appRoleAssignments: undefined,
      roles: user.appRoleAssignments.map(({ roleName }) =>
        getRoleMappings(chaptersLookup, roleName),
      ),
    }))
    .sort((a, b) => {
      const nameA = a.displayName.toUpperCase(); // ignore upper and lowercase
      const nameB = b.displayName.toUpperCase(); // ignore upper and lowercase
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }

      // names must be equal
      return 0;
    });

  return json({
    users: admins,
  });
}

export default function Index() {
  const { users } = useLoaderData<typeof loader>();

  return (
    <>
      <Title>User permissions</Title>

      <hr className="my-4" />

      <div className="mt-2 overflow-auto bg-white">
        <table className="table">
          <thead>
            <tr>
              <th align="left" className="w-14">
                #
              </th>
              <th align="left">Full name</th>
              <th align="left">Email</th>
              <th align="left">Permissions</th>
              <th align="right">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td className="border" colSpan={6}>
                  <i>No users</i>
                </td>
              </tr>
            )}
            {users.map(({ id, displayName, email, roles }, index) => (
              <tr key={id}>
                <td className="border">{index + 1}</td>
                <td className="border">{displayName}</td>
                <td className="border">{email}</td>
                <td className="border">{roles.join(", ")}</td>
                <td className="border">
                  <Link to="" className="btn btn-success btn-xs w-full gap-2">
                    <PageEdit className="hidden h-4 w-4 lg:block" />
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
