import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";

import invariant from "tiny-invariant";
import { Xmark, Clock, FloppyDiskArrowIn } from "iconoir-react";

import { Title, Autocomplete } from "~/components";

import {
  assignStudentToMentorAsync,
  getMentorWithStudentsAsync,
  getStudentsInChapterAsync,
  removeMentorStudentAssignement,
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
    chapterId: params.chapterId,
    availableStudents,
    mentorWithStudents,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.mentorId, "mentorId not found");

  const formData = await request.formData();

  const studentId = formData.get("studentId")?.toString();
  if (studentId === undefined) {
    throw new Error();
  }

  if (request.method === "POST") {
    await assignStudentToMentorAsync(
      request,
      Number(params.mentorId),
      Number(studentId),
    );
  } else {
    await removeMentorStudentAssignement(
      Number(params.mentorId),
      Number(studentId),
    );
  }

  return null;
}

export default function Index() {
  const {
    chapterId,
    availableStudents,
    mentorWithStudents: { firstName, lastName, mentorToStudentAssignement },
  } = useLoaderData<typeof loader>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { state, Form, submit } = (useFetcher as any)();

  const isLoading = state === "loading";

  const onMentorRemoved =
    (studentFullName: string) => (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (confirm(`Are you sure you want to unassign "${studentFullName}"?`)) {
        submit(e.currentTarget, {
          method: "DELETE",
        });
      }
    };

  return (
    <>
      <Title to={`/admin/chapters/${chapterId}/mentors`}>
        Assign student to mentor
      </Title>

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

            <Form method="POST" className="flex flex-col gap-6 lg:flex-row">
              <div className="lg:w-96">
                <Autocomplete
                  name="studentId"
                  placeholder="start typing to select a student"
                  initialOptions={availableStudents.map(
                    ({ id, firstName, lastName }) => ({
                      label: `${firstName} ${lastName}`,
                      value: id.toString(),
                    }),
                  )}
                />
              </div>

              <button
                disabled={isLoading}
                className="btn btn-primary w-52 gap-5"
                type="submit"
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner"></span> Loading...
                  </>
                ) : (
                  <>
                    <FloppyDiskArrowIn className="h-6 w-6" /> Add
                  </>
                )}
              </button>
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
                        to={`/admin/chapters/${chapterId}/sessions`}
                        className="btn btn-info gap-3"
                      >
                        <Clock className="h-6 w-6" />
                        View sessions
                      </Link>

                      <Form
                        onSubmit={onMentorRemoved(`${firstName} ${lastName}`)}
                      >
                        <input type="hidden" name="studentId" value={id} />
                        <button
                          disabled={isLoading}
                          className="btn btn-error w-48 gap-3"
                          type="submit"
                        >
                          {isLoading ? (
                            <>
                              <span className="loading loading-spinner"></span>{" "}
                              Loading...
                            </>
                          ) : (
                            <>
                              <Xmark className="h-6 w-6" />
                              Remove
                            </>
                          )}
                        </button>
                      </Form>
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
