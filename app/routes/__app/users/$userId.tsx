import type { LoaderArgs } from "@remix-run/server-runtime";

import { Link, useCatch, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";

import invariant from "tiny-invariant";

import { getAssignedChaptersToUserAsync } from "~/models/chapter.server";
import { getAzureUserByIdAsync } from "~/models/azure.server";

import XMarkIcon from "@heroicons/react/24/solid/XMarkIcon";
import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import ArrowSmallLeftIcon from "@heroicons/react/24/solid/ArrowSmallLeftIcon";

export async function loader({ params }: LoaderArgs) {
  invariant(params.userId, "userId not found");

  const [azureUser, assignedChapters] = await Promise.all([
    getAzureUserByIdAsync(params.userId),
    getAssignedChaptersToUserAsync(params.userId),
  ]);

  return json({
    user: {
      ...azureUser,
      assignedChapters,
    },
  });
}

export default function Chapter() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div>
      <h3 className="text-2xl font-bold">{user.displayName}</h3>
      <p className="mt-4 py-2">Email: {user.mail ?? "-"}</p>
      <p className="py-2">
        Role:{" "}
        {user.appRoleAssignments.length > 0 ? (
          user.appRoleAssignments.map(({ roleName }) => roleName).join(", ")
        ) : (
          <i>No roles assigned</i>
        )}
      </p>

      <hr className="my-4" />

      <div className="overflow-auto">
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th align="left" className="p-2">
                Assigned to
              </th>
              <th align="right" className="p-2">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {user.assignedChapters.length === 0 && (
              <tr>
                <td colSpan={2} className="border p-2">
                  <i>No Chapters assigned to this user</i>
                </td>
              </tr>
            )}
            {user.assignedChapters.map(({ chapter: { id, name } }) => (
              <tr key={id}>
                <td className="border p-2">
                  <span>{name}</span>
                  <input type="hidden" name="chapterIds" value={id} />
                </td>
                <td align="right" className="border p-2">
                  <Link
                    to={`chapters/${id}/delete`}
                    className="flex w-32 items-center justify-center rounded bg-red-600 px-3 py-1 text-white"
                  >
                    <XMarkIcon className="mr-2 w-5" />
                    <span>Remove</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center space-x-6">
        <Link
          to="../"
          relative="path"
          className="flex w-24 items-center justify-center space-x-2 rounded border border-zinc-300 bg-zinc-200 px-4 py-2 hover:bg-zinc-300"
        >
          <ArrowSmallLeftIcon className="w-5" />
          <span>Back</span>
        </Link>
        <Link
          to="chapters/assign"
          relative="path"
          className="my-8 flex w-64 items-center justify-center space-x-2 rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600"
        >
          <PlusIcon className="w-5 text-white" />
          <span>Assign to a Chapter</span>
        </Link>
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
