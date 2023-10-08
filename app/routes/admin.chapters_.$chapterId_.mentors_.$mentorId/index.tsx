import type { ActionArgs, LoaderArgs } from "@remix-run/node";

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
import { Cancel } from "iconoir-react";

export async function loader({ params }: LoaderArgs) {
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
    availableStudents,
    mentorWithStudents,
  });
}

export async function action({ request, params }: ActionArgs) {
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

  return json({
    message: "Successfully saved",
  });
}

export default function Index() {
  const {
    availableStudents,
    mentorWithStudents: { firstName, lastName, mentorToStudentAssignement },
  } = useLoaderData<typeof loader>();

  return (
    <>
      <BackHeader />

      <Title>Assign student to mentor</Title>

      <article className="prose flex w-full max-w-none gap-12">
        <div className="w-56">
          <h4>Mentor</h4>
          <div>
            {firstName} {lastName}
          </div>
        </div>

        <div className="w-2/5">
          <h4>Assigned students</h4>
          <ul>
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
                      <Cancel className="h-4 w-4" />
                      Remove
                    </Link>
                  </div>
                </li>
              ),
            )}
          </ul>
        </div>

        <div>
          <h4>Assign a new student</h4>
          <Form method="post" className="flex gap-6">
            <div className="w-96">
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

            <SubmitFormButton label="Add" className="mt-6 justify-between" />
          </Form>
        </div>
      </article>
    </>
  );
}
