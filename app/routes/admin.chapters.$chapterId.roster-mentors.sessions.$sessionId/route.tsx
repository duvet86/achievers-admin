import type { Route } from "./+types/route";

import { Form, redirect, useSearchParams, useSubmit } from "react-router";
import dayjs from "dayjs";
import invariant from "tiny-invariant";
import {
  BookmarkBook,
  Check,
  Eye,
  FloppyDiskArrowIn,
  InfoCircle,
  StatsReport,
  Trash,
  WarningTriangle,
  Xmark,
} from "iconoir-react";

import { Message, SelectSearch, StateLink, Title } from "~/components";

import {
  addStudentToSessionAsync,
  getChapterByIdAsync,
  getSessionByIdAsync,
  getStudentsForMentorAsync,
  removeSessionAsync,
} from "./services.server";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.sessionId, "sessionId not found");

  const [chapter, session] = await Promise.all([
    getChapterByIdAsync(Number(params.chapterId)),
    getSessionByIdAsync(Number(params.sessionId)),
  ]);

  const students = await getStudentsForMentorAsync(
    session.chapterId,
    session.mentor.id,
  );

  const studentIdsInSession = session.studentSession.map(
    ({ student: { id } }) => id,
  );

  return {
    chapter,
    session,
    attendedOnLabel: dayjs(session.attendedOn).format("MMMM D, YYYY"),
    students: students
      .filter(({ id }) => !studentIdsInSession.includes(id))
      .map(({ id, fullName }) => ({
        label: fullName,
        value: id.toString(),
      })),
  };
}

export async function action({ params, request }: Route.ActionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.sessionId, "sessionId not found");

  const formData = await request.formData();
  const action = formData.get("action");

  switch (action) {
    case "addStudent": {
      const selectedStudentId = formData.get("studentId");

      await addStudentToSessionAsync(
        Number(params.sessionId),
        Number(selectedStudentId),
      );

      break;
    }
    case "restore":
    case "cancelAvailable": {
      const session = await removeSessionAsync({
        sessionId: Number(params.sessionId),
        studentId: null,
      });

      const parsedUrl = new URL(request.url);

      return redirect(
        `/admin/chapters/${params.chapterId}/roster-mentors/${session.mentorId}/attended-on/${dayjs(session.attendedOn).format("YYYY-MM-DD")}/new?${parsedUrl.searchParams}`,
      );
    }
    case "cancelStudent": {
      const selectedStudentId = formData.get("studentId");

      const session = await removeSessionAsync({
        sessionId: Number(params.sessionId),
        studentId: Number(selectedStudentId),
      });
      const parsedUrl = new URL(request.url);

      return redirect(
        `/admin/chapters/${params.chapterId}/roster-mentors/${session.mentorId}/attended-on/${dayjs(session.attendedOn).format("YYYY-MM-DD")}/new?${parsedUrl.searchParams}`,
      );
    }
    default:
      throw new Error();
  }

  return {
    successMessage: "Session updated successfully",
  };
}

export default function Index({
  loaderData: { attendedOnLabel, chapter, session, students },
  actionData,
}: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const submit = useSubmit();

  const handleRemoveSession = () => {
    if (!confirm(`Are you sure?`)) {
      return;
    }

    const formData = new FormData();
    formData.append("action", "cancelAvailable");

    void submit(formData, {
      method: "POST",
    });
  };

  const handleStudentRemoveSession = (studentId: number) => () => {
    if (!confirm(`Are you sure?`)) {
      return;
    }

    const formData = new FormData();
    formData.append("action", "cancelStudent");
    formData.append("studentId", studentId.toString());

    void submit(formData, {
      method: "POST",
    });
  };

  const handleRestoreUnavailableSession = () => {
    if (!confirm(`Are you sure?`)) {
      return;
    }

    const formData = new FormData();
    formData.append("action", "restore");

    void submit(formData, {
      method: "POST",
    });
  };

  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row">
        <Title>
          Session of &quot;
          {attendedOnLabel}&quot;
        </Title>

        <Message key={Date.now()} successMessage={actionData?.successMessage} />
      </div>

      <div className="my-8 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-2 border-b border-gray-300 p-2">
          <div className="w-72 font-bold">Chapter</div>
          <div className="flex-1">{chapter.name}</div>
        </div>

        <div className="flex items-center justify-between gap-2 border-b border-gray-300 p-2">
          <div className="font-bold sm:w-72">Session</div>
          <div className="sm:flex-1">{attendedOnLabel}</div>
        </div>

        <div className="flex items-center justify-between gap-2 border-b border-gray-300 p-2">
          <div className="font-bold sm:w-72">Mentor</div>
          <div className="sm:flex-1">{session.mentor.fullName}</div>
        </div>

        {session.status === "UNAVAILABLE" ? (
          <div className="flex items-center justify-between gap-4">
            <p className="alert alert-error w-full">
              <InfoCircle />
              Mentor is marked as unavailable for this session
            </p>

            <button
              className="btn btn-secondary w-full sm:w-48"
              type="button"
              onClick={handleRestoreUnavailableSession}
            >
              <BookmarkBook />
              Restore
            </button>
          </div>
        ) : (
          session.studentSession.length === 0 && (
            <div className="flex items-center gap-4">
              <p className="alert alert-info w-full">
                <InfoCircle />
                Mentor is marked as available for this session
              </p>

              <button
                className="btn btn-error w-full sm:w-48"
                type="button"
                onClick={handleRemoveSession}
              >
                <Trash />
                Remove
              </button>
            </div>
          )
        )}

        {session.status !== "UNAVAILABLE" && (
          <>
            <Form method="POST" className="flex w-full items-end gap-4">
              <SelectSearch
                key={session.studentSession.length}
                name="studentId"
                placeholder="Select a student"
                options={students}
                required
                showClearButton
              />

              <button
                className="btn btn-primary w-48 gap-2"
                type="submit"
                name="action"
                value="addStudent"
              >
                <FloppyDiskArrowIn />
                Book
              </button>
            </Form>

            <div className="overflow-auto bg-white">
              <table className="table">
                <thead>
                  <tr>
                    <th align="left" className="p-2">
                      Student
                    </th>
                    <th align="left" className="p-2">
                      Completed On
                    </th>
                    <th align="left" className="p-2">
                      Signed Off On
                    </th>
                    <th align="right" className="p-2">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {session.studentSession.map(
                    ({
                      id,
                      student,
                      completedOn,
                      signedOffOn,
                      isCancelled,
                    }) => (
                      <tr key={id}>
                        <td className="p-2">{student.fullName}</td>
                        {isCancelled ? (
                          <>
                            <td colSpan={2}>
                              <div className="bg-error flex gap-2 rounded p-2">
                                <WarningTriangle /> Session has been cancelled
                              </div>
                            </td>
                            <td align="right">
                              <StateLink
                                to={`/admin/student-sessions/${id}?${searchParams.toString()}`}
                                className="btn btn-sm"
                              >
                                <StatsReport /> View reason
                              </StateLink>
                            </td>
                          </>
                        ) : (
                          <>
                            <td>
                              <div className="flex items-center gap-2">
                                {completedOn ? (
                                  <Check className="text-success" />
                                ) : (
                                  <Xmark className="text-error" />
                                )}
                                <span>
                                  {completedOn &&
                                    dayjs(completedOn).format("MMMM D, YYYY")}
                                </span>
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                {signedOffOn ? (
                                  <Check className="text-success" />
                                ) : (
                                  <Xmark className="text-error" />
                                )}
                                <span>
                                  {signedOffOn &&
                                    dayjs(signedOffOn).format("MMMM D, YYYY")}
                                </span>
                              </div>
                            </td>
                            <td className="p-2" align="right">
                              {completedOn ? (
                                <StateLink
                                  to={`/admin/student-sessions/${id}/report?${searchParams.toString()}`}
                                  className="btn btn-success btn-sm"
                                >
                                  <StatsReport /> Go to report
                                </StateLink>
                              ) : (
                                <div className="flex justify-end gap-4">
                                  <StateLink
                                    className="btn btn-info btn-sm w-32"
                                    to={`/admin/student-sessions/${id}`}
                                  >
                                    <Eye />
                                    View session
                                  </StateLink>

                                  <button
                                    className="btn btn-error btn-sm w-32"
                                    type="button"
                                    onClick={handleStudentRemoveSession(
                                      student.id,
                                    )}
                                  >
                                    <Xmark />
                                    Remove
                                  </button>
                                </div>
                              )}
                            </td>
                          </>
                        )}
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}
