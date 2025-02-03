import type { LoaderFunctionArgs } from "react-router";

import { useLoaderData } from "react-router";

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
        !(
          appRoleAssignments.length === 1 &&
          appRoleAssignments.map(({ roleName }) => roleName).includes("Mentor")
        ),
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

  return {
    users: admins,
  };
}

export default function Index() {
  const { users } = useLoaderData<typeof loader>();

  return (
    <>
      <Title>User permissions</Title>

      <hr className="my-4" />

      <div className="mt-2 overflow-auto bg-white">
        <table className="table-pin-rows table">
          <thead>
            <tr>
              <th align="left" className="w-14">
                #
              </th>
              <th align="left">Name</th>
              <th align="left">Email</th>
              <th align="left">Permissions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <i>No users</i>
                </td>
              </tr>
            )}
            {users.map(({ id, displayName, email, roles }, index) => (
              <tr key={id}>
                <td>{index + 1}</td>
                <td>{displayName}</td>
                <td>{email}</td>
                <td>{roles.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
