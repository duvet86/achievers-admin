import type { LoaderArgs } from "@remix-run/server-runtime";

import { json } from "@remix-run/server-runtime";
import { Link, useCatch, useLoaderData } from "@remix-run/react";

import invariant from "tiny-invariant";

import { getChapterByIdAsync } from "~/services";

import ArrowSmallLeftIcon from "@heroicons/react/24/solid/ArrowSmallLeftIcon";
import AcademicCapIcon from "@heroicons/react/24/solid/AcademicCapIcon";

import Title from "~/components/Title";

import { getMenteesAtChapterByIdAsync } from "./services.server";

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
      <div>
        <Link to="../" relative="path" className="btn-ghost btn mb-2 gap-2">
          <ArrowSmallLeftIcon className="w-6" />
          Back
        </Link>
      </div>

      <hr className="mb-4" />

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
                Assigned mentors
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
            {chapter.mentees.map(({ id, firstName, lastName, Mentors }) => (
              <tr key={id}>
                <td className="border p-2">{firstName}</td>
                <td className="border p-2">{lastName}</td>
                <td className="border p-2 text-right">
                  {Mentors.length === 0 && (
                    <i>No mentors assigned to this Mentee</i>
                  )}
                  {Mentors.map(({ userId }) => userId).join(", ")}
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
