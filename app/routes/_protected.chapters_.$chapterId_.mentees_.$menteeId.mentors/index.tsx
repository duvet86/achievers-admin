import type { LoaderArgs } from "@remix-run/server-runtime";

import { Link, useCatch, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";

import invariant from "tiny-invariant";

import { getSessionUserAsync, getAzureUsersWithRolesAsync } from "~/services";

import ArrowSmallLeftIcon from "@heroicons/react/24/solid/ArrowSmallLeftIcon";
import XMarkIcon from "@heroicons/react/24/solid/XMarkIcon";
import AcademicCapIcon from "@heroicons/react/24/solid/AcademicCapIcon";

import Title from "~/components/Title";

import { getMenteeById } from "./services.server";

export async function loader({ request, params }: LoaderArgs) {
  invariant(params.menteeId, "menteeId not found");

  const sessionUser = await getSessionUserAsync(request);

  const mentee = await getMenteeById(params.menteeId);

  const mentorIds = mentee.Mentors.map(({ userId }) => userId);

  const azureMentors = await getAzureUsersWithRolesAsync(
    sessionUser.accessToken,
    mentorIds
  );

  return json({
    mentee,
    assignedMentors: azureMentors,
  });
}

export default function Index() {
  const { mentee, assignedMentors } = useLoaderData<typeof loader>();

  return (
    <>
      <div>
        <Link to="../../" relative="path" className="btn-ghost btn mb-2 gap-2">
          <ArrowSmallLeftIcon className="w-6" />
          Back
        </Link>
      </div>

      <hr className="mb-4" />

      <Title>
        Mentors assigned to "{mentee.firstName} {mentee.lastName}"
      </Title>

      <div className="overflow-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th align="left" className="p-2">
                Email
              </th>
              <th align="right" className="p-2">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {assignedMentors.length === 0 && (
              <tr>
                <td colSpan={2} className="border p-2">
                  <i>No mentors assigned to this mentee</i>
                </td>
              </tr>
            )}
            {assignedMentors.map(({ id, email }) => (
              <tr key={id}>
                <td className="border p-2">{email}</td>
                <td className="w-64 border" align="right">
                  <Link
                    to={`${id}/mentor/delete`}
                    relative="path"
                    className="btn-error btn-xs btn flex gap-2 align-middle"
                  >
                    <XMarkIcon className="h-6 w-6" />
                    Remove Mentor
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <Link className="btn-primary btn gap-2" to="assign" relative="path">
          <AcademicCapIcon className="h-6 w-6" />
          Assign a Mentor
        </Link>
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
