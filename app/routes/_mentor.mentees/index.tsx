import type { LoaderArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { getSessionUserAsync } from "~/services";

import AcademicCapIcon from "@heroicons/react/24/solid/AcademicCapIcon";

import Title from "~/components/Title";

import { getMenteesMentoredByIdAsync } from "./services.server";
import BackHeader from "~/components/BackHeader";

export async function loader({ request }: LoaderArgs) {
  const sessionUser = await getSessionUserAsync(request);

  const mentees = await getMenteesMentoredByIdAsync(sessionUser.userId);

  return json({
    mentees,
  });
}

export default function Index() {
  const { mentees } = useLoaderData<typeof loader>();

  return (
    <>
      <BackHeader />

      <Title>My Mentees</Title>

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
                    to={id}
                    relative="path"
                    className="btn-success btn-xs btn flex gap-2 align-middle"
                  >
                    <AcademicCapIcon className="h-4 w-4" />
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
