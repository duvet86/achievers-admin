import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";

import invariant from "tiny-invariant";
import { Xmark, Clock } from "iconoir-react";

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
    mentorId: params.mentorId,
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
    mentorId,
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
          {mentorToStudentAssignement.length === 0 && (
            <p className="italic">No students assigned</p>
          )}
          <ol>
            {mentorToStudentAssignement.map(
              ({ student: { id, firstName, lastName } }) => (
                <li key={id} className="border-b pb-2">
                  <div className="flex items-center justify-between">
                    {firstName} {lastName}
                    <div className="flex gap-6">
                      <Link
                        to={`/admin/users/${mentorId}/students/${id}/sessions`}
                        className="btn btn-info gap-3"
                      >
                        <Clock className="h-6 w-6" />
                        View sessions
                      </Link>
                      <Link to={`remove/${id}`} className="btn btn-error gap-3">
                        <Xmark className="h-6 w-6" />
                        Remove
                      </Link>
                    </div>
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
