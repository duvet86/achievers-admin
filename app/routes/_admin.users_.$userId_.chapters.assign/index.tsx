import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";

import { json, redirect } from "@remix-run/server-runtime";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";

import invariant from "tiny-invariant";

import {
  getSessionUserAsync,
  getAzureUserWithRolesByIdAsync,
} from "~/services";

import PlusIcon from "@heroicons/react/24/solid/PlusIcon";

import Select from "~/components/Select";

import {
  assignChapterToUserAsync,
  getChaptersAsync,
  getUserAtChaptersByIdAsync,
} from "./services.server";
import BackHeader from "~/components/BackHeader";

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
  const transition = useNavigation();

  const isSubmitting = transition.state === "submitting";

  return (
    <>
      <BackHeader to="../../" />

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

        <div className="mt-6">
          <button className="btn-primary btn gap-2">
            <PlusIcon className="h-6 w-6" />
            Save
          </button>
        </div>
      </Form>
    </>
  );
}
