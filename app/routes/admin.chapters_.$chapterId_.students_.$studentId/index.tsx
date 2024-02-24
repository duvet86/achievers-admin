import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Clock, Xmark } from "iconoir-react";

import { Title, Autocomplete, SubmitFormButton } from "~/components";

import {
  assignStudentToMentorAsync,
  getStudentWithMentorsAsync,
  getMentorsInChapterAsync,
} from "./services.server";

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
    studentId: params.studentId,
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

  return null;
}

export default function Index() {
  const {
    studentId,
    availableMentors,
    studentWithMentors: { firstName, lastName, mentorToStudentAssignement },
  } = useLoaderData<typeof loader>();

  return (
    <>
      <Title>Assign mentor to student</Title>

      <article className="prose w-full max-w-none">
        <div className="flex flex-col gap-12 lg:flex-row">
          <div className="lg:w-1/2">
            <h4>Student</h4>
            <div>
              {firstName} {lastName}
            </div>
          </div>

          <div>
            <h4>Assign a new mentor</h4>

            <Form method="post" className="flex flex-col gap-6 lg:flex-row">
              <div className="lg:w-96">
                <Autocomplete
                  name="selectedMentorId"
                  placeholder="start typing to select a mentor"
                  initialOptions={availableMentors.map(
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
          <h4>Assigned mentors</h4>
          <ol>
            {mentorToStudentAssignement.map(
              ({ user: { firstName, lastName, id } }) => (
                <li key={id} className="border-b pb-2">
                  <div className="flex items-center justify-between">
                    {firstName} {lastName}
                    <div className="flex gap-6">
                      <Link
                        to={`/admin/users/${id}/students/${studentId}/sessions`}
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
