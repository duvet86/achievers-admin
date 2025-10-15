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
  WarningTriangle,
  Xmark,
} from "iconoir-react";

import {
  Message,
  SelectSearch,
  StateLink,
  Textarea,
  Title,
} from "~/components";

import {
  addMentorToSessionAsync,
  getChapterByIdAsync,
  getMentorsForStudentAsync,
  getStudentSessionByIdAsync,
  removeSessionAsync,
  restoreAvailabilityAsync,
} from "./services.server";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.studentSessionId, "studentSessionId not found");

  const [chapter, studentSession] = await Promise.all([
    getChapterByIdAsync(Number(params.chapterId)),
    getStudentSessionByIdAsync(Number(params.studentSessionId)),
  ]);

  const mentors = await getMentorsForStudentAsync(
    studentSession.chapterId,
    studentSession.student.id,
    studentSession.attendedOn,
  );

  return {
    chapter,
    studentSession,
    attendedOnLabel: dayjs(studentSession.attendedOn).format("MMMM D, YYYY"),
    mentors,
  };
}

export async function action({ params, request }: Route.ActionArgs) {
  invariant(params.chapterId, "chapterId not found");
  invariant(params.studentSessionId, "studentSessionId not found");

  const formData = await request.formData();
  const action = formData.get("action");

  switch (action) {
    case "addMentor": {
      const selectedMentorId = formData.get("mentorId")!.toString();

      await addMentorToSessionAsync({
        studentSessionId: Number(params.studentSessionId),
        mentorId: Number(selectedMentorId),
      });

      break;
    }
    case "restoreAvailability": {
      const status = formData.get("status")!.toString();

      const studentSession = await restoreAvailabilityAsync(
        Number(params.studentSessionId),
        status,
      );

      const parsedUrl = new URL(request.url);

      return redirect(
        `/admin/chapters/${params.chapterId}/roster-students/${studentSession.studentId}/attended-on/${dayjs(studentSession.attendedOn).format("YYYY-MM-DD")}/new?${parsedUrl.searchParams}`,
      );
    }
    case "removeSession": {
      const sessionId = formData.get("sessionId")!.toString();

      const session = await removeSessionAsync(Number(sessionId));
      const parsedUrl = new URL(request.url);

      return redirect(
        `/admin/chapters/${params.chapterId}/roster-students/${session.studentSession.studentId}/attended-on/${dayjs(session.attendedOn).format("YYYY-MM-DD")}/new?${parsedUrl.searchParams}`,
      );

      break;
    }
    default:
      throw new Error();
  }

  return {
    successMessage: "Session updated successfully",
  };
}

export default function Index({
  loaderData: { attendedOnLabel, chapter, studentSession, mentors },
  actionData,
}: Route.ComponentProps) {
  const [searchParams] = useSearchParams();

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!confirm(`Are you sure?`)) {
      event.preventDefault();
      return;
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row">
        <Title>
          Student session of &quot;
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
          <div className="font-bold sm:w-72">Student</div>
          <div className="sm:flex-1">{studentSession.student.fullName}</div>
        </div>

        {studentSession.status === "UNAVAILABLE" && (
          <div>
            <Form
              method="POST"
              onSubmit={handleFormSubmit}
              className="flex items-center justify-between gap-4"
            >
              <p className="alert alert-error w-full">
                <InfoCircle />
                Student is marked as unavailable for this session
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

            <div className="items-centerd mt-4 flex gap-4 p-2">
              <div className="text-error font-bold sm:w-72">Reason</div>
              <div className="sm:flex-1">
                <Textarea defaultValue={studentSession.reason!} readOnly />
              </div>
            </div>
          </div>
        )}

        {studentSession.status !== "UNAVAILABLE" && (
          <>
            <Form method="POST" className="flex w-full items-end gap-4">
              <SelectSearch
                key={studentSession.session.length}
                name="mentorId"
                placeholder="Select a mentor"
                options={mentors}
                required
                showClearButton
              />

              <button
                className="btn btn-primary w-48 gap-2"
                type="submit"
                name="action"
                value="addMentor"
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
                      Mentor
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
                  {studentSession.session.map(
                    ({
                      id,
                      completedOn,
                      signedOffOn,
                      isCancelled,
                      mentorSession: { mentor },
                    }) => (
                      <tr key={id}>
                        <td className="p-2">{mentor.fullName}</td>
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
