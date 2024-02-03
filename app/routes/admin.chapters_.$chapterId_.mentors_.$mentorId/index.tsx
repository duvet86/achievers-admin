import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import {
  Title,
  BackHeader,
  Autocomplete,
  SubmitFormButton,
} from "~/components";

import {
  assignStudentToMentorAsync,
  getMentorWithStudentsAsync,
  getStudentsInChapterAsync,
} from "./services.server";
import { Xmark } from "iconoir-react";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.mentorId, "mentorId not found");

  const [mentorWithStudents, availableStudents] = await Promise.all([
    getMentorWithStudentsAsync(Number(params.mentorId)),
    getStudentsInChapterAsync(
      Number(params.chapterId),
      Number(params.mentorId),
    ),
  ]);

  return json({
    chapterId: params.chapterId,
    availableStudents,
    mentorWithStudents,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.mentorId, "mentorId not found");

  const formData = await request.formData();

  const selectedStudentId = formData.get("selectedStudentId")?.toString();
  if (selectedStudentId === undefined) {
    throw new Error();
  }

  await assignStudentToMentorAsync(
    request,
    Number(params.mentorId),
    Number(selectedStudentId),
  );

  return null;
}

export default function Index() {
  const {
    chapterId,
    availableStudents,
    mentorWithStudents: { firstName, lastName, mentorToStudentAssignement },
  } = useLoaderData<typeof loader>();

  return (
    <>
      <BackHeader to={`/admin/chapters/${chapterId}/mentors`} />

      <Title>Assign student to mentor</Title>

      <article className="prose w-full max-w-none">
        <div className="flex flex-col gap-12 lg:flex-row">
          <div className="lg:w-1/2">
            <h4>Mentor</h4>
            <div>
              {firstName} {lastName}
            </div>
          </div>

          <div>
            <h4>Assign a new student</h4>

            <Form method="post" className="flex flex-col gap-6 lg:flex-row">
              <div className="lg:w-96">
                <Autocomplete
                  name="selectedStudentId"
                  placeholder="start typing to select a student"
                  initialOptions={availableStudents.map(
                    ({ id, firstName, lastName }) => ({
                      label: `${firstName} ${lastName}`,
                      value: id.toString(),
                    }),
                  )}
                />
              </div>

              <SubmitFormButton label="Add" />
            </Form>
          </div>
        </div>

        <hr />

        <div>
          <h4>Assigned students</h4>
          <ol>
            {mentorToStudentAssignement.map(
              ({ student: { firstName, lastName, id } }) => (
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
          </ol>
        </div>
      </article>
    </>
  );
}
