import type { ActionArgs, LoaderArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import { getCurrentUserADIdAsync } from "~/services";
import { Select, BackHeader, SubmitFormButton, Title } from "~/components";

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

  const userAtChapterIds = user.userAtChapter.map(({ chapter }) => chapter.id);

  return json({
    user,
    availableChapters: chapters.filter(
      ({ id }) => !userAtChapterIds.includes(id)
    ),
  });
}

export async function action({ request, params }: ActionArgs) {
  invariant(params.userId, "userId not found");

  const formData = await request.formData();

  const chapterId = formData.get("chapterId");

  if (chapterId === null) {
    return json({
      error: "Select a chapter please.",
    });
  }

  const currentUserAzureId = await getCurrentUserADIdAsync(request);

  await assignChapterToUserAsync(
    Number(params.userId),
    Number(chapterId),
    currentUserAzureId
  );

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
        <Title>Assign a Chapter to "{user.email}"</Title>

        <Select
          label="Select a Chapter"
          name="chapterId"
          disabled={isSubmitting}
          options={[{ value: "", label: "Select a Chapter" }].concat(
            availableChapters.map(({ id, name }) => ({
              label: name,
              value: id.toString(),
            }))
          )}
        />

        <SubmitFormButton message={actionData?.error} />
      </Form>
    </>
  );
}
