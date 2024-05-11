import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Clock, FloppyDiskArrowIn, Xmark } from "iconoir-react";

import { Title, Autocomplete } from "~/components";

import {
  assignStudentToMentorAsync,
  getStudentWithMentorsAsync,
  getMentorsInChapterAsync,
  removeMentorStudentAssignement,
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

  const mentorId = formData.get("mentorId")?.toString();
  if (!mentorId) {
    return json({
      message: "No mentor selected",
    });
  }

  if (request.method === "POST") {
    await assignStudentToMentorAsync(
      request,
      Number(mentorId),
      Number(params.studentId),
    );
  } else {
    await removeMentorStudentAssignement(
      Number(mentorId),
      Number(params.studentId),
    );
  }

  return null;
}

export default function Index() {
  const {
    studentId,
    availableMentors,
    studentWithMentors: { firstName, lastName, mentorToStudentAssignement },
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

            <Form method="POST" className="flex flex-col gap-6 lg:flex-row">
              <div className="lg:w-96">
                <Autocomplete
                  name="mentorId"
                  placeholder="start typing to select a mentor"
                  initialOptions={availableMentors.map(
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
                      <Form
                        onSubmit={onMentorRemoved(`${firstName} ${lastName}`)}
                      >
                        <input type="hidden" name="mentorId" value={id} />
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
