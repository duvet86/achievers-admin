import type { LoaderArgs } from "@remix-run/server-runtime";
import type { AzureUserWebAppWithRole } from "~/services";

import { json } from "@remix-run/server-runtime";
import { Form, Link, useCatch, useLoaderData } from "@remix-run/react";

import invariant from "tiny-invariant";

import {
  getSessionUserAsync,
  getChapterByIdAsync,
  getAzureUsersWithRolesAsync,
  Roles,
} from "~/services";

import ArrowSmallLeftIcon from "@heroicons/react/24/solid/ArrowSmallLeftIcon";
import UsersIcon from "@heroicons/react/24/solid/UsersIcon";

import Title from "~/components/Title";
import Input from "~/components/Input";

import { getUsersAtChapterByIdAsync } from "./services.server";

export async function loader({ request, params }: LoaderArgs) {
  invariant(params.chapterId, "chapterId not found");

  const sessionUser = await getSessionUserAsync(request);

  const [chapter, usersAtChapter, azureUsers] = await Promise.all([
    getChapterByIdAsync(params.chapterId),
    getUsersAtChapterByIdAsync(params.chapterId),
    getAzureUsersWithRolesAsync(sessionUser.accessToken),
  ]);

  const userIds = usersAtChapter.map(({ userId }) => userId);

  const azureUsersLookUp = azureUsers.reduce<
    Record<string, AzureUserWebAppWithRole>
  >((res, value) => {
    res[value.id] = value;

    return res;
  }, {});

  return json({
    chapter: {
      ...chapter,
      assignedUsers: userIds.map((userId) => azureUsersLookUp[userId]),
    },
    mentorRoleId: Roles.Mentor,
  });
}

export default function ChapterId() {
  const { chapter, mentorRoleId } = useLoaderData<typeof loader>();

  return (
    <>
      <div>
        <Link to="../" relative="path" className="btn-ghost btn mb-2 gap-2">
          <ArrowSmallLeftIcon className="w-6" />
          Back
        </Link>
      </div>

      <hr className="mb-4" />

      <Title>Edit chapter</Title>

      <Form method="post">
        <Input defaultValue={chapter.name} label="Name" name="name" />
        <Input defaultValue={chapter.address} label="Address" name="address" />

        <button className="btn-primary btn float-right mt-6 w-28" type="submit">
          Save
        </button>
      </Form>

      <hr className="my-6" />

      <Title>Mentors</Title>

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
                Assign Mentees
              </th>
            </tr>
          </thead>
          <tbody>
            {chapter.assignedUsers.map(({ id, email, appRoleAssignments }) => (
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
                <td className="w-64 border" align="right">
                  {appRoleAssignments
                    .map(({ appRoleId }) => appRoleId)
                    .includes(mentorRoleId) ? (
                    <Link
                      to={`users/${id}/mentees/assign`}
                      className="btn-success btn-xs btn flex gap-2 align-middle"
                    >
                      Assign Mentee
                      <UsersIcon className="mr-4 h-4 w-4" />
                    </Link>
                  ) : (
                    <span className="mr-4 w-6">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
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
