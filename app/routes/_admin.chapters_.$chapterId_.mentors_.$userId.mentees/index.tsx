import type { LoaderArgs } from "@remix-run/node";

import { Link, useCatch, useLoaderData } from "@remix-run/react";

import { json } from "@remix-run/node";

import invariant from "tiny-invariant";

import {
  getSessionUserAsync,
  getAzureUserWithRolesByIdAsync,
} from "~/services";

import XMarkIcon from "@heroicons/react/24/solid/XMarkIcon";
import AcademicCapIcon from "@heroicons/react/24/solid/AcademicCapIcon";

import Title from "~/components/Title";

import { getMenteesMentoredByAsync } from "./services.server";
import BackHeader from "~/components/BackHeader";

export async function loader({ request, params }: LoaderArgs) {
  invariant(params.userId, "userId not found");

  const sessionUser = await getSessionUserAsync(request);

  const [mentor, mentees] = await Promise.all([
    getAzureUserWithRolesByIdAsync(sessionUser.accessToken, params.userId),
    getMenteesMentoredByAsync(params.userId),
  ]);

  return json({
    mentor,
    mentees,
  });
}

export default function Index() {
  const { mentor, mentees } = useLoaderData<typeof loader>();

  return (
    <>
      <BackHeader to="../../" />

      <Title>Mentees mentored by "{mentor.email}"</Title>

      <div className="overflow-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th align="left" className="p-2">
                Mentees
              </th>
              <th align="right" className="p-2">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {mentees.length === 0 && (
              <tr>
                <td colSpan={2} className="border p-2">
                  <i>No mentees assigned to this mentor</i>
                </td>
              </tr>
            )}
            {mentees.map(({ Mentee: { id, firstName, lastName } }) => (
              <tr key={id}>
                <td className="border p-2">
                  {firstName} {lastName}
                </td>
                <td className="w-64 border" align="right">
                  <Link
                    to={`${id}/mentees`}
                    relative="path"
                    className="btn-error btn-xs btn flex gap-2 align-middle"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    Remove Mentee
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
          Assign Mentee
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
