import type { ActionArgs, LoaderArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import { Select, BackHeader, SubmitFormButton } from "~/components";

import {
  assignChapterToUserAsync,
  getChaptersAsync,
  getUserAtChapterByIdAsync,
} from "./services.server";

export async function loader({ params }: LoaderArgs) {
  invariant(params.userId, "userId not found");

  const [user, chapters] = await Promise.all([
    getUserAtChapterByIdAsync(Number(params.userId)),
    getChaptersAsync(),
  ]);

  return json({
    user,
    availableChapters: chapters.filter(({ id }) => user.chapter.id !== id),
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

  await assignChapterToUserAsync(Number(params.userId), chapterId.toString());

  return redirect(`/users/${params.userId}`);
}

export default function Assign() {
  const { user, availableChapters } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const transition = useNavigation();

  const isSubmitting = transition.state === "submitting";

  return (
    <>
      <BackHeader to="../../" />

      <Form method="post">
        <h1 className="mb-4 text-xl font-medium">
          Assign a Chapter to{" "}
          <span className="font-medium">'{user.email}'</span>
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

        <SubmitFormButton message={actionData?.error} />
      </Form>
    </>
  );
}
