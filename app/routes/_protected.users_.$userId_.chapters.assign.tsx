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

import { getSessionUserAsync } from "~/session.server";
import { getAzureUserWithRolesByIdAsync } from "~/services/azure.server";
import {
  assignChapterToUserAsync,
  getUserAtChaptersByIdAsync,
} from "~/services/user.server";
import { getChaptersAsync } from "~/services/chapter.server";

import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import ArrowSmallLeftIcon from "@heroicons/react/24/solid/ArrowSmallLeftIcon";

import Select from "~/components/Select";

export async function loader({ request, params }: LoaderArgs) {
  invariant(params.userId, "userId not found");

  const sessionUser = await getSessionUserAsync(request);

  const [azureUser, userAtChapter, chapters] = await Promise.all([
    getAzureUserWithRolesByIdAsync(sessionUser.accessToken, params.userId),
    getUserAtChaptersByIdAsync(params.userId),
    getChaptersAsync(),
  ]);

  const assignedChapterIds = userAtChapter.map(({ Chapter }) => Chapter.id);

  return json({
    azureUser,
    availableChapters: chapters.filter(
      ({ id }) => !assignedChapterIds.includes(id)
    ),
  });
}

export async function action({ request, params }: ActionArgs) {
  invariant(params.userId, "userId not found");

  const formData = await request.formData();

  const chapterId = formData.get("chapterId");

  if (chapterId === null) {
    return json({
      error: "Select a Chapter please.",
    });
  }

  await assignChapterToUserAsync(params.userId, chapterId.toString(), "");

  return redirect(`/users/${params.userId}`);
}

export default function Assign() {
  const { azureUser, availableChapters } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const transition = useTransition();

  const isSubmitting = transition.state === "submitting";

  return (
    <Form method="post">
      <h1 className="mb-4 text-xl font-medium">
        Assign a Chapter to{" "}
        <span className="font-medium">'{azureUser.email}'</span>
      </h1>

      <Select
        label="Select a Chapter"
        name="chapterId"
        disabled={isSubmitting}
        options={[{ value: "", label: "Select a Chapter" }].concat(
          availableChapters.map(({ id, name }) => ({
            label: name,
            value: id,
          }))
        )}
      />

      <p className="mt-4 text-red-600">{actionData?.error}</p>

      <div className="mt-6 flex items-center space-x-6">
        <Link
          to="../../"
          relative="path"
          className="btn-ghost btn"
          type="submit"
        >
          <ArrowSmallLeftIcon className="w-6" />
          Back
        </Link>
        <button className="btn-primary btn gap-2">
          <PlusIcon className="h-6 w-6" />
          Save
        </button>
      </div>
    </Form>
  );
}
