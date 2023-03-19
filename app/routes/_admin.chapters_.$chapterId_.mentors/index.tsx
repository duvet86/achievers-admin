import type { LoaderArgs } from "@remix-run/server-runtime";
import type { AzureUserWebAppWithRole } from "~/services";

import { json } from "@remix-run/server-runtime";
import { Link, useCatch, useLoaderData } from "@remix-run/react";

import invariant from "tiny-invariant";

import {
  getAzureUsersWithRolesAsync,
  getSessionUserAsync,
  Roles,
} from "~/services";

import AcademicCapIcon from "@heroicons/react/24/solid/AcademicCapIcon";

import Title from "~/components/Title";

import {
  getUsersAtChapterByIdAsync,
  getChapterByIdAsync,
} from "./services.server";
import BackHeader from "~/components/BackHeader";

export async function loader({ request, params }: LoaderArgs) {
  invariant(params.chapterId, "chapterId not found");

  const sessionUser = await getSessionUserAsync(request);

  const [chapter, usersAtChapter, azureUsers] = await Promise.all([
    getChapterByIdAsync(params.chapterId),
    getUsersAtChapterByIdAsync(params.chapterId),
    getAzureUsersWithRolesAsync(sessionUser.accessToken),
  ]);

  const userIds = usersAtChapter.map(({ userId }) => userId);

  const azureMentorsLookUp = azureUsers
    .filter(({ appRoleAssignments }) =>
      appRoleAssignments
        .map(({ appRoleId }) => appRoleId)
        .includes(Roles.Mentor)
    )
    .reduce<Record<string, AzureUserWebAppWithRole>>((res, value) => {
      res[value.id] = value;

      return res;
    }, {});

  return json({
    chapter: {
      ...chapter,
      mentors: userIds
        .filter((userId) => azureMentorsLookUp[userId])
        .map((userId) => azureMentorsLookUp[userId]),
    },
  });
}

export default function ChapterId() {
  const { chapter } = useLoaderData<typeof loader>();

  return (
    <>
      <BackHeader />

      <Title>Mentors in {chapter.name}</Title>

      <div className="overflow-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th align="left" className="p-2">
                Mentor Email
              </th>
              <th align="right" className="p-2">
                Mentees
              </th>
            </tr>
          </thead>
          <tbody>
            {chapter.mentors.length === 0 && (
              <tr>
                <td colSpan={3} className="border p-2">
                  <i></i>No mentors in this chapter
                </td>
              </tr>
            )}
            {chapter.mentors.map(({ id, email }) => (
              <tr key={id}>
                <td className="border p-2">{email}</td>
                <td className="w-64 border" align="right">
                  <Link
                    to={`${id}/mentees`}
                    relative="path"
                    className="btn-success btn-xs btn flex gap-2 align-middle"
                  >
                    <AcademicCapIcon className="mr-4 h-4 w-4" />
                    View Mentee
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
