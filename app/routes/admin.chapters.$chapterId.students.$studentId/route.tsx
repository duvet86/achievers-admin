import type { Route } from "./+types/route";

import { useFetcher } from "react-router";
import invariant from "tiny-invariant";
import {
  Clock,
  FloppyDiskArrowIn,
  WarningTriangle,
  Xmark,
} from "iconoir-react";

import { Title, SelectSearch, StateLink } from "~/components";

import {
  assignStudentToMentorAsync,
  getStudentWithMentorsAsync,
  getMentorsInChapterAsync,
  removeMentorStudentAssignement,
} from "./services.server";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.studentId, "studentId not found");

  const [studentWithMentors, availableMentors] = await Promise.all([
    getStudentWithMentorsAsync(Number(params.studentId)),
    getMentorsInChapterAsync(
      Number(params.chapterId),
      Number(params.studentId),
    ),
  ]);

  return {
    chapterId: params.chapterId,
    availableMentors,
    studentWithMentors,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.studentId, "studentId not found");

  const formData = await request.formData();

  const mentorId = formData.get("mentorId")?.toString();
  if (mentorId === undefined) {
    return {
      mentorId: "",
      message: "You need to select a mentor first",
    };
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

  return {
    mentorId,
    message: null,
  };
}

export default function Index({
  loaderData: {
    availableMentors,
    studentWithMentors: { fullName, mentorToStudentAssignement },
  },
}: Route.ComponentProps) {
  const { state, Form, data, submit } = useFetcher<{
    message: string | null;
    mentorId: string;
  }>();
  const isLoading = state !== "idle";

  const onMentorRemoved =
    (studentFullName: string) => (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (confirm(`Are you sure you want to unassign "${studentFullName}"?`)) {
        void submit(e.currentTarget, {
          method: "DELETE",
        });
      }
    };

  return (
    <>
      <Title>Assign mentor to student</Title>

      <article className="prose w-full max-w-none">
        <div className="flex flex-col sm:flex-row sm:gap-12">
          <div className="sm:w-1/2">
            <h4>Student</h4>
            <div className="mt-4 text-xl">{fullName}</div>
          </div>

          <div>
            <h4>Assign a new mentor</h4>

            <Form
              method="POST"
              className="flex flex-col items-end gap-6 sm:flex-row"
            >
              <div className="w-full sm:w-96">
                <SelectSearch
                  key={data?.mentorId}
                  showClearButton
                  name="mentorId"
                  placeholder="start typing to select a mentor"
                  required
                  options={availableMentors.map(({ id, fullName }) => ({
                    label: fullName,
                    value: id.toString(),
                  }))}
                />
              </div>

              <button
                disabled={isLoading}
                className="btn btn-primary w-full sm:w-52"
                type="submit"
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner"></span> Loading...
                  </>
                ) : (
                  <>
                    <FloppyDiskArrowIn /> Add
                  </>
                )}
              </button>
            </Form>

            {data?.message && (
              <p className="text-error flex items-center gap-2">
                <WarningTriangle />
                {data?.message}
              </p>
            )}
          </div>
        </div>

        <hr />

        <div>
          <h4>Assigned mentors</h4>
          <ol>
            {mentorToStudentAssignement.map(({ user: { fullName, id } }) => (
              <li key={id} className="border-b border-gray-300 pb-2">
                <div className="flex flex-wrap items-center justify-between">
                  {fullName}
                  <div className="flex gap-2 sm:gap-6">
                    <StateLink
                      to="/admin/sessions"
                      className="btn btn-info hidden w-40 sm:flex"
                    >
                      <Clock />
                      View sessions
                    </StateLink>

                    <Form onSubmit={onMentorRemoved(fullName)}>
                      <input type="hidden" name="mentorId" value={id} />
                      <button
                        disabled={isLoading}
                        className="btn btn-error w-40"
                        type="submit"
                      >
                        {isLoading ? (
                          <>
                            <span className="loading loading-spinner"></span>{" "}
                            Loading...
                          </>
                        ) : (
                          <>
                            <Xmark />
                            Remove
                          </>
                        )}
                      </button>
                    </Form>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </article>
    </>
  );
}
