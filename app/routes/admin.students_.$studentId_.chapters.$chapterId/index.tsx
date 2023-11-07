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
  assignChapterToStudentAsync,
  removeChapterFromStudentAsync,
  getChaptersAsync,
  getStudentAtChapterByIdAsync,
} from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.studentId, "student not found");

  const [student, chapters] = await Promise.all([
    getStudentAtChapterByIdAsync(Number(params.studentId)),
    getChaptersAsync(),
  ]);

  return json({
    student,
    availableChapters:
      params.chapterId === "new"
        ? chapters
        : chapters.filter(({ id }) => parseInt(params.chapterId || "") !== id),
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.studentId, "student not found");
  invariant(params.chapterId, "chapter not found");

  const formData = await request.formData();

  const chapterId = formData.get("chapterId");

  if (chapterId === null) {
    return json({
      errorMessage: "Select a chapter please.",
    });
  }

  const currentUserAzureId = await getCurrentUserADIdAsync(request);

  if (params.chapterId !== "new") {
    await removeChapterFromStudentAsync(
      Number(params.studentId),
      Number(params.chapterId),
    );
  }

  await assignChapterToStudentAsync(
    Number(params.studentId),
    Number(chapterId),
    currentUserAzureId,
  );

  return redirect(`/admin/students/${params.studentId}`);
}

export default function Assign() {
  const { student, availableChapters } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const transition = useNavigation();

  const isSubmitting = transition.state === "submitting";

  return (
    <>
      <BackHeader />

      <Form method="post">
        <Title>
          Assign a chapter to "{student.firstName} {student.lastName}"
        </Title>

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
