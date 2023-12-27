import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import {
  Title,
  BackHeader,
  Autocomplete,
  SubmitFormButton,
} from "~/components";

import {
  assignStudentToMentorAsync,
  getStudentWithMentorsAsync,
  getMentorsInChapterAsync,
} from "./services.server";
import { Xmark } from "iconoir-react";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.studentId, "studentId not found");

  const [studentWithMentors, availableMentors] = await Promise.all([
    getStudentWithMentorsAsync(Number(params.studentId)),
    getMentorsInChapterAsync(
      Number(params.chapterId),
      Number(params.studentId),
    ),
  ]);

  return json({
    chapterId: params.chapterId,
    availableMentors,
    studentWithMentors,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.studentId, "studentId not found");

  const formData = await request.formData();

  const selectedMentorId = formData.get("selectedMentorId")?.toString();
  if (!selectedMentorId) {
    return json({
      message: "No mentor selected",
    });
  }

  await assignStudentToMentorAsync(
    request,
    Number(selectedMentorId),
    Number(params.studentId),
  );

  return json({
    message: "Successfully saved",
  });
}

export default function Index() {
  const {
    chapterId,
    availableMentors,
    studentWithMentors: { firstName, lastName, mentorToStudentAssignement },
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <>
      <BackHeader to={`/admin/${chapterId}/students`} />

      <Title>Assign mentor to student</Title>

      <article className="prose flex w-full max-w-none gap-12">
        <div className="w-56">
          <h4>Student</h4>
          <div>
            {firstName} {lastName}
          </div>
        </div>

        <div className="w-2/5">
          <h4>Assigned mentors</h4>
          <ul>
            {mentorToStudentAssignement.map(
              ({ user: { firstName, lastName, id } }) => (
                <li key={id} className="border-b pb-2">
                  <div className="flex justify-between">
                    <div>
                      {firstName} {lastName}
                    </div>
                    <Link
                      to={`remove/${id}`}
                      className="btn btn-error btn-xs gap-5"
                    >
                      <Xmark className="h-4 w-4" />
                      Remove
                    </Link>
                  </div>
                </li>
              ),
            )}
          </ul>
        </div>

        <div>
          <h4>Assign a new mentor</h4>
          <Form method="post" className="flex flex-col">
            <div className="w-96">
              <Autocomplete
                name="selectedMentorId"
                placeholder="start typing to select a student"
                initialOptions={availableMentors.map(
                  ({ id, firstName, lastName }) => ({
                    label: `${firstName} ${lastName}`,
                    value: id.toString(),
                  }),
                )}
              />
            </div>

            <SubmitFormButton
              label="Add"
              successMessage={actionData?.message}
              className="mt-6 justify-between"
            />
          </Form>
        </div>
      </article>
    </>
  );
}
