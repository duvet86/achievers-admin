import type { LoaderArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Link, useCatch, useLoaderData } from "@remix-run/react";

import invariant from "tiny-invariant";

import AcademicCapIcon from "@heroicons/react/24/solid/AcademicCapIcon";
import UserGroupIcon from "@heroicons/react/24/solid/UserGroupIcon";

import Title from "~/components/Title";

import {
  getMenteesAtChapterByIdAsync,
  getChapterByIdAsync,
} from "./services.server";
import BackHeader from "~/components/BackHeader";

export async function loader({ params }: LoaderArgs) {
  invariant(params.chapterId, "chapterId not found");

  const [chapter, menteesAtChapter] = await Promise.all([
    getChapterByIdAsync(params.chapterId),
    getMenteesAtChapterByIdAsync(params.chapterId),
  ]);

  return json({
    chapter: {
      ...chapter,
      mentees: menteesAtChapter,
    },
  });
}

export default function ChapterId() {
  const { chapter } = useLoaderData<typeof loader>();

  return (
    <>
      <BackHeader />

      <Title>Mentees in {chapter.name}</Title>

      <div className="overflow-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th align="left" className="w-1/4 p-2">
                First name
              </th>
              <th align="left" className="w-2/5 p-2">
                Last name
              </th>
              <th align="left" className="p-2 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {chapter.mentees.length === 0 && (
              <tr>
                <td colSpan={3} className="border p-2">
                  <i>No mentees in this Chapter</i>
                </td>
              </tr>
            )}
            {chapter.mentees.map(({ id, firstName, lastName }) => (
              <tr key={id}>
                <td className="border p-2">{firstName}</td>
                <td className="border p-2">{lastName}</td>
                <td className="border p-2 text-right">
                  <Link
                    to={`${id}/mentors`}
                    className="btn-success btn-xs btn gap-2 align-middle"
                    relative="path"
                  >
                    <UserGroupIcon className="mr-4 h-4 w-4" />
                    View Mentors
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <Link className="btn-primary btn gap-2" to="new" relative="path">
          <AcademicCapIcon className="h-6 w-6" />
          Create new Mentee
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
