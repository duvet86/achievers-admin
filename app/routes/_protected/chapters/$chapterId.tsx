import type { LoaderArgs } from "@remix-run/server-runtime";
import type { AzureUser } from "~/models/azure.server";

import { redirect, json } from "@remix-run/server-runtime";
import { Link, useCatch, useLoaderData } from "@remix-run/react";

import invariant from "tiny-invariant";

import {
  getChapterByIdAsync,
  getUsersAtChapterByIdAsync,
} from "~/models/chapter.server";
import { getAzureUsersAsync, Roles } from "~/models/azure.server";

import ArrowSmallLeftIcon from "@heroicons/react/24/solid/ArrowSmallLeftIcon";
import UsersIcon from "@heroicons/react/24/solid/UsersIcon";

export async function loader({ params }: LoaderArgs) {
  try {
    invariant(params.chapterId, "chapterId not found");

    const [chapter, usersAtChapter, azureUsers] = await Promise.all([
      getChapterByIdAsync(params.chapterId),
      getUsersAtChapterByIdAsync(params.chapterId),
      getAzureUsersAsync(),
    ]);

    const userIds = usersAtChapter.map(({ userId }) => userId);

    const azureUsersLookUp = azureUsers.reduce<Record<string, AzureUser>>(
      (res, value) => {
        res[value.id] = value;

        return res;
      },
      {}
    );

    return json({
      chapter: {
        ...chapter,
        assignedUsers: userIds.map((userId) => azureUsersLookUp[userId]),
      },
      mentorRoleId: Roles.Mentor,
    });
  } catch (error) {
    throw redirect("/logout");
  }
}

export default function ChapterId() {
  const { chapter, mentorRoleId } = useLoaderData<typeof loader>();

  return (
    <div>
      <h3 className="text-2xl font-bold">{chapter.name}</h3>
      <p className="py-6">{chapter.address}</p>

      <hr className="my-4" />

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
              <th align="right" className="p-2">
                Assign Students
              </th>
            </tr>
          </thead>
          <tbody>
            {chapter.assignedUsers.map(
              ({ id, displayName, appRoleAssignments }) => (
                <tr key={id}>
                  <td className="border p-2">{displayName}</td>
                  <td className="border p-2">
                    {appRoleAssignments.length > 0 ? (
                      appRoleAssignments
                        .map(({ roleName }) => roleName)
                        .join(", ")
                    ) : (
                      <i className="text-sm">No roles assigned</i>
                    )}
                  </td>
                  <td className="border p-2" align="right">
                    {appRoleAssignments
                      .map(({ appRoleId }) => appRoleId)
                      .includes(mentorRoleId) ? (
                      <Link to={`users/${id}`}>
                        <UsersIcon className="mr-4 w-6 text-blue-500" />
                      </Link>
                    ) : (
                      <span className="mr-4 w-6">-</span>
                    )}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <Link to="../" relative="path" className="btn-ghost btn mt-6 gap-2">
        <ArrowSmallLeftIcon className="w-6" />
        Back
      </Link>
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
