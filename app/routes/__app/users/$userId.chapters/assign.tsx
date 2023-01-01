import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";

import { json, redirect } from "@remix-run/server-runtime";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";

import invariant from "tiny-invariant";

import { requireSessionUserAsync } from "~/session.server";
import { getAzureUserByIdAsync } from "~/models/azure.server";
import { assignChapterToUserAsync } from "~/models/user.server";
import {
  getAssignedChaptersToUserAsync,
  getChaptersAsync,
} from "~/models/chapter.server";

import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import ArrowSmallLeftIcon from "@heroicons/react/24/solid/ArrowSmallLeftIcon";

import ButtonPrimary from "~/components/ButtonPrimary";

export async function loader({ params }: LoaderArgs) {
  invariant(params.userId, "userId not found");

  const [user, chapters, assignedChapters] = await Promise.all([
    getAzureUserByIdAsync(params.userId),
    getChaptersAsync(),
    getAssignedChaptersToUserAsync(params.userId, false),
  ]);

  const assignedChapterIds = assignedChapters.map(({ chapterId }) => chapterId);

  const availableChapters = chapters.filter(
    ({ id }) => !assignedChapterIds.includes(id)
  );

  return json({
    user,
    availableChapters,
  });
}

export async function action({ request, params }: ActionArgs) {
  invariant(params.userId, "userId not found");

  const sessionUser = await requireSessionUserAsync(request);

  const formData = await request.formData();

  const chapterId = formData.get("chapterId");

  if (!chapterId) {
    return json({
      error: "Select a Chapter please.",
    });
  }

  await assignChapterToUserAsync(
    params.userId,
    chapterId.toString(),
    sessionUser.displayName
  );

  return redirect(`/users/${params.userId}`);
}

export default function Assign() {
  const { user, availableChapters } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const transition = useTransition();

  const isSubmitting = transition.state === "submitting";

  return (
    <Form method="post">
      <h1 className="mb-4 text-xl font-medium">
        Assing Chapter to User{" "}
        <span className="font-medium">'{user.displayName}'</span>
      </h1>

      <label
        htmlFor="chapterId"
        className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
      >
        Select a Chapter
      </label>
      <select
        name="chapterId"
        className="mb-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        defaultValue=""
        disabled={isSubmitting}
      >
        <option value="">Select a Chapter</option>
        {availableChapters.map(({ id, name }) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>

      <p className="mt-4 text-red-600">{actionData?.error}</p>

      <div className="flex items-center space-x-6">
        <Link
          to="../../"
          relative="path"
          className="mt-8 flex w-24 items-center justify-center space-x-2 rounded border border-zinc-300 bg-zinc-200 px-4 py-2 hover:bg-zinc-300"
          type="submit"
        >
          <ArrowSmallLeftIcon className="w-5" />
          <span>Back</span>
        </Link>
        <ButtonPrimary className="mt-8 w-24 space-x-2" type="submit">
          <PlusIcon className="w-5 text-white" />
          <span>Save</span>
        </ButtonPrimary>
      </div>
    </Form>
  );
}
