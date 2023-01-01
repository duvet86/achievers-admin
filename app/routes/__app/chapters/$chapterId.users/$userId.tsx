import type { MentoringStudent } from "@prisma/client";
import type { LoaderArgs } from "@remix-run/server-runtime";

import { Link, useCatch, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";

import invariant from "tiny-invariant";

import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import XMarkIcon from "@heroicons/react/24/solid/XMarkIcon";

import { getAzureUsersAsync } from "~/models/azure.server";
import { getAssignedChaptersToUserAsync } from "~/models/chapter.server";
import { getStudentsMentoredByAsync } from "~/models/user.server";

export async function loader({ params }: LoaderArgs) {
  invariant(params.userId, "userId not found");

  const [azureUsers, mentoringStudents, assignedChapters] = await Promise.all([
    getAzureUsersAsync(),
    getStudentsMentoredByAsync(params.userId),
    getAssignedChaptersToUserAsync(params.userId),
  ]);

  const azureUser = azureUsers.find(({ id }) => id === params.userId);
  invariant(azureUser, "azureUser not found");

  const menteesLookUp = mentoringStudents.reduce<
    Record<string, MentoringStudent>
  >((res, value) => {
    res[value.studentId] = value;

    return res;
  }, {});

  const azureMentees = azureUsers
    .filter(({ id }) => menteesLookUp[id] !== undefined)
    .map((azureUser) => ({
      ...azureUser,
      frequencyInDays: menteesLookUp[azureUser.id].frequencyInDays,
    }));

  return json({
    user: {
      ...azureUser,
      mentoringStudents: azureMentees,
    },
    assignedChapters,
  });
}

export default function ChapterUser() {
  const {
    user,

    assignedChapters,
  } = useLoaderData<typeof loader>();

  return (
    <div>
      <h3 className="text-2xl font-bold">{user.userPrincipalName}</h3>
      <p className="mt-4 py-2">Email: {user.mail ?? "-"}</p>
      <p className="py-2">
        Role:{" "}
        {user.appRoleAssignments.length > 0 ? (
          user.appRoleAssignments.map(({ roleName }) => roleName).join(", ")
        ) : (
          <i>No roles assigned</i>
        )}
      </p>
      <p>
        Assigned Chapter:{" "}
        {assignedChapters.map(({ chapter: { name } }) => name).join(", ")}
      </p>

      <hr className="my-4" />

      <Link
        to="mentees/assign"
        className="my-8 flex w-64 items-center justify-center space-x-2 rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600"
        type="submit"
      >
        <PlusIcon className="w-5 text-white" />
        <span>Assign new Student</span>
      </Link>

      <div className="overflow-auto">
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th align="left" className="p-2">
                Mentee
              </th>
              <th align="left" className="p-2">
                Frequency
              </th>
              <th align="right" className="p-2">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {user.mentoringStudents.length === 0 && (
              <tr>
                <td colSpan={3} className="border p-2">
                  <i>No Mentees assigned to this Mentor</i>
                </td>
              </tr>
            )}
            {user.mentoringStudents.map(
              ({ id, userPrincipalName, frequencyInDays }) => (
                <tr key={id}>
                  <td className="border p-2">
                    <span>{userPrincipalName}</span>
                    <input type="hidden" name="studentIds" value={id} />
                  </td>
                  <td className="border p-2">
                    <span>Every {frequencyInDays} days</span>
                    <input type="hidden" name="frequencies" value={id} />
                  </td>
                  <td align="right" className="border p-2">
                    <Link
                      to={`mentees/${id}/delete`}
                      className="flex w-32 items-center justify-center rounded bg-red-600 px-3 py-1 text-white"
                    >
                      <XMarkIcon className="mr-2 w-5" />
                      <span>Remove</span>
                    </Link>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Note not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
