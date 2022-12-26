import type {
  ActionArgs,
  LoaderArgs,
  TypedResponse,
} from "@remix-run/server-runtime";

import type { UpdateUser } from "~/models/user.server";

import { Form, useActionData, useCatch, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";

import { useState } from "react";
import invariant from "tiny-invariant";

import { XMarkIcon } from "@heroicons/react/24/solid";

import { getUserByIdAsync, updateAsync } from "~/models/user.server";
import { getChaptersAsync } from "~/models/chapter.server";

const roles = ["GUEST", "MENTOR", "STUDENT", "ADMIN"];

export async function loader({ params }: LoaderArgs) {
  invariant(params.userId, "userId not found");

  const [user, chapters] = await Promise.all([
    getUserByIdAsync(params.userId),
    getChaptersAsync(),
  ]);

  invariant(user, "user not found");

  return json({ user, chapters });
}

export async function action({ request, params }: ActionArgs): Promise<
  TypedResponse<{
    error: string | undefined;
  }>
> {
  const userId = params.userId;
  invariant(userId, "userId not found");

  const urlSearchParams = new URLSearchParams(await request.text());

  const role = urlSearchParams.get("role");
  invariant(role, "role not found");

  const chapterIds = urlSearchParams.getAll("chapterIds");
  invariant(chapterIds, "role not found");

  const updateUser: UpdateUser = {
    id: userId,
    role,
    chapterIds,
  };

  console.log("user", updateUser);

  await updateAsync(updateUser);

  return json({ error: undefined });
}

export default function Chapter() {
  const { user: initialUser, chapters } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const [user, setUser] = useState<typeof initialUser>(initialUser);

  const removeChapter = (chapterId: string) => () => {
    setUser((state) => ({
      ...state,
      chapters: state.chapters.filter((c) => c.chapterId !== chapterId),
    }));
  };

  const assignChapter = (chapterId: string) => {
    if (user.chapters.findIndex((c) => c.chapterId === chapterId) !== -1) {
      return;
    }

    const chapter = chapters.find((c) => c.id === chapterId);
    invariant(chapter, "userId not found");

    setUser((state) => ({
      ...state,
      chapters: [
        ...state.chapters,
        {
          assignedAt: "",
          assignedBy: "",
          chapterId,
          userId: state.id,
          userRelId: null,
          chapter,
        },
      ],
    }));
  };

  return (
    <div>
      <h3 className="text-2xl font-bold">User</h3>
      <p className="py-2">{user.email}</p>

      <hr className="my-4" />

      <Form method="post" className="mt-4">
        <div className="mb-4 rounded bg-gray-200 p-2">
          <label
            htmlFor="role"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Select a Role
          </label>
          <select
            name="role"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            defaultValue={user.role}
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded bg-gray-200 p-2">
          <label
            htmlFor="addChapter"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Select a Chapter
          </label>
          <select
            name="addChapter"
            className="mb-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            defaultValue=""
            onChange={(event) => {
              assignChapter(event.target.value);
              event.target.value = "";
            }}
          >
            <option value="">Assign a Chapter</option>
            {chapters.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>

          <table className="w-full table-auto">
            <thead>
              <tr>
                <th align="left" className="p-2">
                  Belongs to
                </th>
                <th align="right" className="p-2">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {user.chapters.map(({ chapter: { id, name } }) => (
                <tr key={id}>
                  <td className="border p-2">
                    <span>{name}</span>
                    <input type="hidden" name="chapterIds" value={id} />
                  </td>
                  <td align="right" className="border p-2">
                    <button onClick={removeChapter(id)}>
                      <XMarkIcon className="mr-4 w-6 text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-red-900">{actionData?.error}</p>

        <button
          type="submit"
          className="mt-4 rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
      </Form>
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
