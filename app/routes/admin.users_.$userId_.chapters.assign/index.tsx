import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

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

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.userId, "userId not found");

  const [user, chapters] = await Promise.all([
    getUserAtChapterByIdAsync(Number(params.userId)),
    getChaptersAsync(),
  ]);

  const userAtChapterIds = user.userAtChapter.map(({ chapter }) => chapter.id);

  return json({
    userId: params.userId,
    user,
    availableChapters: chapters.filter(
      ({ id }) => !userAtChapterIds.includes(id),
    ),
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.userId, "userId not found");

  const formData = await request.formData();

  const chapterId = formData.get("chapterId");

  if (chapterId === null) {
    return json({
      errorMessage: "Select a chapter please.",
    });
  }

  const currentUserAzureId = await getCurrentUserADIdAsync(request);

  await assignChapterToUserAsync(
    Number(params.userId),
    Number(chapterId),
    currentUserAzureId,
  );

  return redirect(`/admin/users/${params.userId}`);
}

export default function Assign() {
  const { userId, user, availableChapters } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const transition = useNavigation();

  const isSubmitting = transition.state === "submitting";

  return (
    <>
      <BackHeader to={`/admin/users/${userId}`} />

      <Form method="post">
        <Title>Assign a chapter to "{user.email}"</Title>

        <Select
          label="Select a chapter"
          name="chapterId"
          disabled={isSubmitting}
          options={[{ value: "", label: "Select a chapter" }].concat(
            availableChapters.map(({ id, name }) => ({
              label: name,
              value: id.toString(),
            })),
          )}
        />

        <SubmitFormButton
          errorMessage={actionData?.errorMessage}
          className="mt-6 justify-between"
        />
      </Form>
    </>
  );
}
