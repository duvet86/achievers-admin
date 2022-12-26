import type { LoaderArgs } from "@remix-run/server-runtime";
import { useCatch, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";

import invariant from "tiny-invariant";

import { getChapterByIdAsync } from "~/models/chapter.server";

export async function loader({ params }: LoaderArgs) {
  invariant(params.chapterId, "chapterId not found");

  const chapter = await getChapterByIdAsync(params.chapterId);
  invariant(chapter, "chapter not found");

  return json({ chapter });
}

export default function Chapter() {
  const { chapter } = useLoaderData<typeof loader>();

  return (
    <div>
      <h3 className="text-2xl font-bold">{chapter.name}</h3>
      <p className="py-6">{chapter.address}</p>

      <hr className="my-4" />

      <table className="w-full table-auto">
        <thead>
          <tr>
            <th align="left" className="p-2">
              Email
            </th>
            <th align="left" className="p-2">
              Role
            </th>
          </tr>
        </thead>
        <tbody>
          {chapter.users.map(({ user }) => (
            <tr key={user.id}>
              <td className="border p-2">{user.email}</td>
              <td className="border p-2">{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
