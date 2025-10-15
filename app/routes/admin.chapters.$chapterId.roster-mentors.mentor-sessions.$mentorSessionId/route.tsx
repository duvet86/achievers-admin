/* eslint-disable react-hooks/purity */
import type { Route } from "./+types/route";

import { Form, redirect, useSearchParams } from "react-router";
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
  getMentorSessionByIdAsync,
  getStudentsForMentorAsync,
  removeSessionAsync,
  restoreAvailabilityAsync,
} from "./services.server";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.mentorSessionId, "mentorSessionId not found");

  const [chapter, mentorSession] = await Promise.all([
    getChapterByIdAsync(Number(params.chapterId)),
    getMentorSessionByIdAsync(Number(params.mentorSessionId)),
  ]);

  const students = await getStudentsForMentorAsync(
    mentorSession.chapterId,
    mentorSession.mentor.id,
    mentorSession.attendedOn,
  );

  return {
    chapter,
    mentorSession,
    attendedOnLabel: dayjs(mentorSession.attendedOn).format("MMMM D, YYYY"),
    students,
  };
}

export async function action({ params, request }: Route.ActionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.mentorSessionId, "mentorSessionId not found");

  const formData = await request.formData();
  const action = formData.get("action");

  switch (action) {
    case "addStudent": {
      const selectedStudentId = formData.get("studentId")!.toString();

      await addStudentToSessionAsync({
        mentorSessionId: Number(params.mentorSessionId),
        studentId: Number(selectedStudentId),
      });

      break;
    }
    case "restoreAvailability": {
      const status = formData.get("status")!.toString();

      const mentorSession = await restoreAvailabilityAsync(
        Number(params.mentorSessionId),
        status,
      );

      const parsedUrl = new URL(request.url);

      return redirect(
        `/admin/chapters/${params.chapterId}/roster-mentors/${mentorSession.mentorId}/attended-on/${dayjs(mentorSession.attendedOn).format("YYYY-MM-DD")}/new?${parsedUrl.searchParams}`,
      );
    }
    case "removeSession": {
      const sessionId = formData.get("sessionId")!.toString();

      const session = await removeSessionAsync(Number(sessionId));
      const parsedUrl = new URL(request.url);

      return redirect(
        `/admin/chapters/${params.chapterId}/roster-mentors/${session.mentorSession.mentorId}/attended-on/${dayjs(session.attendedOn).format("YYYY-MM-DD")}/new?${parsedUrl.searchParams}`,
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
  loaderData: { attendedOnLabel, chapter, mentorSession, students },
  actionData,
}: Route.ComponentProps) {
  const [searchParams] = useSearchParams();

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm(`Are you sure?`)) {
      e.preventDefault();
      return;
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row">
        <Title>
          Mentor session of &quot;
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
          <div className="sm:flex-1">{mentorSession.mentor.fullName}</div>
        </div>

        {mentorSession.status === "UNAVAILABLE" ? (
          <Form
            method="POST"
            onSubmit={handleFormSubmit}
            className="flex items-center justify-between gap-4"
          >
            <p className="alert alert-error w-full">
              <InfoCircle />
              Mentor is marked as unavailable for this session
            </p>

            <input type="hidden" name="status" value="AVAILABLE" />

            <button
              className="btn btn-secondary w-full sm:w-48"
              type="submit"
              name="action"
              value="restoreAvailability"
            >
              <BookmarkBook />
              Restore
            </button>
          </Form>
        ) : (
          mentorSession.session.length === 0 && (
            <Form
              method="POST"
              onSubmit={handleFormSubmit}
              className="flex items-center gap-4"
            >
              <p className="alert alert-info w-full">
                <InfoCircle />
                Mentor is marked as available for this session
              </p>

              <input type="hidden" name="status" value="UNAVAILABLE" />

              <button
                className="btn btn-error w-full sm:w-48"
                type="submit"
                name="action"
                value="restoreAvailability"
              >
                <Trash />
                Remove
              </button>
            </Form>
          )
        )}

        {mentorSession.status !== "UNAVAILABLE" && (
          <>
            <Form method="POST" className="flex w-full items-end gap-4">
              <SelectSearch
                key={mentorSession.session.length}
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
                  {mentorSession.session.map(
                    ({
                      id,
                      completedOn,
                      signedOffOn,
                      isCancelled,
                      studentSession: { student },
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
                                to={`/admin/sessions/${id}?${searchParams.toString()}`}
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
                                  to={`/admin/sessions/${id}/report?${searchParams.toString()}`}
                                  className="btn btn-success btn-sm"
                                >
                                  <StatsReport /> Go to report
                                </StateLink>
                              ) : (
                                <Form
                                  method="POST"
                                  onSubmit={handleFormSubmit}
                                  className="flex justify-end gap-4"
                                >
                                  <StateLink
                                    className="btn btn-info btn-sm w-32"
                                    to={`/admin/sessions/${id}`}
                                  >
                                    <Eye />
                                    View session
                                  </StateLink>

                                  <input
                                    type="hidden"
                                    name="sessionId"
                                    value={id}
                                  />

                                  <button
                                    className="btn btn-error btn-sm w-32"
                                    type="submit"
                                    name="action"
                                    value="removeSession"
                                  >
                                    <Xmark />
                                    Remove
                                  </button>
                                </Form>
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
