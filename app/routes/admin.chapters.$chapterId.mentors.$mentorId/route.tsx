import type { Route } from "./+types/route";

import { useFetcher } from "react-router";
import invariant from "tiny-invariant";
import {
  Xmark,
  Clock,
  FloppyDiskArrowIn,
  WarningTriangle,
} from "iconoir-react";
import classNames from "classnames";

import { Title, SelectSearch, StateLink } from "~/components";

import {
  assignStudentToMentorAsync,
  getMentorWithStudentsAsync,
  getStudentsInChapterAsync,
  removeMentorStudentAssignement,
} from "./services.server";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.mentorId, "mentorId not found");

  const [mentorWithStudents, availableStudents] = await Promise.all([
    getMentorWithStudentsAsync(Number(params.mentorId)),
    getStudentsInChapterAsync(
      Number(params.chapterId),
      Number(params.mentorId),
    ),
  ]);

  return {
    availableStudents,
    mentorWithStudents,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.mentorId, "mentorId not found");

  const formData = await request.formData();

  const studentId = formData.get("studentId")?.toString();
  if (studentId === undefined || studentId === "") {
    return {
      studentId: "",
      message: "You need to select a student first",
    };
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

  return {
    studentId,
    message: null,
  };
}

export default function Index({
  loaderData: {
    availableStudents,
    mentorWithStudents: {
      id: mentorId,
      chapterId,
      fullName,
      frequencyInDays,
      mentorToStudentAssignement,
    },
  },
}: Route.ComponentProps) {
  const { state, Form, data, submit } = useFetcher<{
    message: string | null;
    studentId: string;
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
      <Title>Assign student to mentor</Title>

      <article className="prose w-full max-w-none">
        <div className="flex flex-col sm:flex-row sm:gap-12">
          <table className="table">
            <thead>
              <tr>
                <th className="p-2">Mentor</th>
                <th className="p-2">Frequency</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2">{fullName}</td>
                <td className="p-2">
                  {frequencyInDays === 14
                    ? "Fortnightly"
                    : frequencyInDays === 7
                      ? "Weekly"
                      : "-"}
                </td>
              </tr>
            </tbody>
          </table>

          <div>
            <h4>Assign a new student</h4>

            <Form
              method="POST"
              className="flex flex-col items-end gap-6 sm:flex-row"
            >
              <div className="w-full sm:w-96">
                <SelectSearch
                  key={data?.studentId}
                  showClearButton
                  name="studentId"
                  placeholder="start typing to select a student"
                  options={availableStudents.map(({ id, fullName }) => ({
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
                    <FloppyDiskArrowIn className="h-6 w-6" /> Add
                  </>
                )}
              </button>
            </Form>

            {data?.message && (
              <p className="text-error flex items-center gap-2">
                <WarningTriangle className="h-6 w-6" />
                {data?.message}
              </p>
            )}
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
              ({ student: { id: studentId, fullName, endDate } }) => (
                <li key={studentId} className="border-b border-gray-300 pb-2">
                  <div
                    className={classNames("flex items-center justify-between", {
                      "text-error": endDate !== null,
                    })}
                  >
                    <span className="flex items-center gap-2">
                      {fullName}
                      {endDate !== null && (
                        <p className="font-bold">(Archived)</p>
                      )}
                    </span>
                    <div className="flex gap-2 sm:gap-6">
                      <StateLink
                        to={`/admin/sessions?chapterId=${chapterId}&mentorId=${mentorId}&studentId=${studentId}&filterReports=ALL`}
                        className="btn btn-info hidden w-40 sm:flex"
                      >
                        <Clock />
                        Latest sessions
                      </StateLink>

                      <Form onSubmit={onMentorRemoved(fullName)}>
                        <input
                          type="hidden"
                          name="studentId"
                          value={studentId}
                        />
                        <button
                          disabled={isLoading}
                          className="btn btn-error btn-xs sm:btn-md sm:w-40"
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
              ),
            )}
          </ol>
        </div>
      </article>
    </>
  );
}
