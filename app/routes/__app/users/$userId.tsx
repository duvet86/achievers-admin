import type {
  ActionArgs,
  LoaderArgs,
  TypedResponse,
} from "@remix-run/server-runtime";

import type { UpdateUser } from "~/models/user.server";

import {
  Form,
  useActionData,
  useCatch,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { json } from "@remix-run/server-runtime";

import { useState } from "react";
import invariant from "tiny-invariant";

import { XMarkIcon } from "@heroicons/react/24/solid";

import { getUserByIdAsync, updateAsync } from "~/models/user.server";
import { getChaptersAsync } from "~/models/chapter.server";

import {
  getAzureRolesAsync,
  getAzureUserByIdAsync,
} from "~/models/azure.server";
import LoadingButton from "~/components/LoadingButton";

export async function loader({ params }: LoaderArgs) {
  invariant(params.userId, "userId not found");

  const [user, chapters, roles] = await Promise.all([
    getUserByIdAsync(params.userId),
    getChaptersAsync(),
    getAzureRolesAsync(),
  ]);

  invariant(user, "user not found");

  const azureUser = await getAzureUserByIdAsync(user.azureObjectId);

  return json({
    user: {
      ...user,
      roles: azureUser.appRoleAssignments.map(
        ({ appRoleId }) => roles[appRoleId].displayName
      ),
    },
    chapters,
  });
}

export async function action({ request, params }: ActionArgs): Promise<
  TypedResponse<{
    error: string | undefined;
  }>
> {
  const userId = params.userId;
  invariant(userId, "userId not found");

  const urlSearchParams = new URLSearchParams(await request.text());

  const chapterIds = urlSearchParams.getAll("chapterIds");
  invariant(chapterIds, "role not found");

  const updateUser: UpdateUser = {
    id: userId,
    chapterIds,
  };

  await updateAsync(updateUser);

  return json({ error: undefined });
}

export default function Chapter() {
  const { user: initialUser, chapters } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const transition = useTransition();

  const [user, setUser] = useState<typeof initialUser>(initialUser);

  const isSubmitting = transition.state !== "idle";

  const removeChapter = (chapterId: string) => () => {
    if (isSubmitting) {
      return;
    }

    setUser((state) => ({
      ...state,
      chapters: state.chapters.filter((c) => c.chapterId !== chapterId),
    }));
  };

  const assignChapter = (chapterId: string) => {
    if (isSubmitting) {
      return;
    }

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
      <p className="py-2">Email: {user.email}</p>
      <p className="py-2">
        Roles:{" "}
        {user.roles.length > 0 ? (
          user.roles.join(", ")
        ) : (
          <i>No roles assigned</i>
        )}
      </p>

      <hr className="my-4" />

      <Form method="post" className="mt-4">
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
            disabled={isSubmitting}
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
              {user.chapters.length === 0 && (
                <tr>
                  <td colSpan={2} className="border p-2">
                    <i>No Chapters assigned to this user</i>
                  </td>
                </tr>
              )}
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

        <LoadingButton className="mt-8" type="submit">
          Save
        </LoadingButton>
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
