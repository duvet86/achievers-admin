import type { SessionLookup } from "../services.server";

import { Link, useFetcher } from "@remix-run/react";
import classNames from "classnames";
import dayjs from "dayjs";

import {
  Group,
  BookmarkBook,
  Check,
  WarningTriangle,
  ThumbsUp,
  Xmark,
  StatsReport,
} from "iconoir-react";

interface Props {
  userId: number;
  chapterId: number;
  datesInTerm: string[];
  student: {
    sessionDateToMentorIdForStudentLookup: SessionLookup;
    mentorIdToMentorNameForStudentLookup: Record<string, string>;
    id: number;
    fullName: string;
  };
  sessionDateToMentorIdForAllStudentsLookup: SessionLookup;
}

export default function TermCalendar({
  userId,
  chapterId,
  datesInTerm,
  student,
  sessionDateToMentorIdForAllStudentsLookup,
}: Props) {
  const { state, submit } = useFetcher();

  const isLoading = state === "loading";
  const sessionDateToMentorIdForStudentLookup =
    student.sessionDateToMentorIdForStudentLookup;
  const mentorIdToMentorNameForStudentLookup =
    student.mentorIdToMentorNameForStudentLookup;

  const assignMentorForSession =
    (
      userId: number,
      chapterId: number,
      studentId: number,
      attendedOn: string,
    ) =>
    () => {
      submit(
        {
          chapterId,
          studentId,
          userId,
          attendedOn,
          action: "create",
        },
        {
          method: "POST",
          encType: "application/json",
        },
      );
    };

  const stealSessionFromPartner = (sessionId: number, userId: number) => () => {
    if (
      !confirm("Are you sure you want to steal the session from you partner?")
    ) {
      return;
    }

    submit(
      {
        sessionId,
        userId,
        action: "update",
      },
      {
        method: "POST",
        encType: "application/json",
      },
    );
  };

  const removeMentorForSession = (sessionId: number) => () => {
    if (!confirm("Are you sure you want to cancel the session?")) {
      return;
    }

    submit(
      {
        sessionId,
        action: "remove",
      },
      {
        method: "POST",
        encType: "application/json",
      },
    );
  };

  return (
    <div className="overflow-auto">
      {isLoading && (
        <div className="fixed z-30 flex h-full w-full justify-center bg-slate-300 bg-opacity-50">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      )}

      <table className="table table-zebra table-pin-rows">
        <thead>
          <tr>
            <th align="left">Session date</th>
            <th align="left">Status</th>
            <th align="left" className="hidden lg:table-cell">
              Report completed
            </th>
            <th align="left" className="hidden lg:table-cell">
              Signed off
            </th>
            <th align="right">Action</th>
          </tr>
        </thead>
        <tbody>
          {datesInTerm.map((attendedOn, index) => {
            const mentorIdForSessionForSelectedStudent =
              sessionDateToMentorIdForStudentLookup[attendedOn];

            const mentorId = mentorIdForSessionForSelectedStudent?.userId;

            const isMySession = mentorId === userId;
            const mentorName = mentorId
              ? mentorIdToMentorNameForStudentLookup[mentorId]
              : undefined;
            const isSessionBookedByPartner =
              !isMySession && mentorName !== undefined;
            const isCurrentDateAlreadyBookedByMe =
              !isMySession &&
              sessionDateToMentorIdForAllStudentsLookup[attendedOn]?.userId ===
                userId;

            const hasReport = mentorIdForSessionForSelectedStudent?.hasReport;
            const isCancelled =
              mentorIdForSessionForSelectedStudent?.isCancelled;

            const isActionDisabled = hasReport ?? isCancelled;

            return (
              <tr
                key={index}
                className={classNames({
                  "bg-success": isMySession && hasReport,
                  "bg-error": isMySession && isCancelled,
                })}
              >
                <td className="w-1/6 border-r font-medium text-gray-800">
                  <div className="flex flex-col">
                    <span>{dayjs(attendedOn).format("dddd")}</span>
                    <span>{dayjs(attendedOn).format("DD/MM/YYYY")}</span>
                  </div>
                </td>
                <td>
                  {isMySession ? (
                    <div className="flex gap-2">
                      <ThumbsUp />
                      {`${mentorName} (Me)`}
                    </div>
                  ) : isSessionBookedByPartner ? (
                    <div className="flex gap-2 text-info">
                      <Group />
                      {`${mentorName} (Partner)`}
                    </div>
                  ) : isCurrentDateAlreadyBookedByMe ? (
                    ""
                  ) : (
                    <div className="flex gap-2 text-success">
                      <Check />
                      Available
                    </div>
                  )}
                </td>
                <td className="hidden lg:table-cell">
                  {mentorIdForSessionForSelectedStudent?.hasReport ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Xmark className="h-4 w-4 text-error" />
                  )}
                </td>
                <td className="hidden lg:table-cell">
                  {mentorIdForSessionForSelectedStudent?.signedOffOn ? (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      {dayjs(
                        mentorIdForSessionForSelectedStudent.signedOffOn,
                      ).format("MMMM D, YYYY")}
                    </div>
                  ) : (
                    <Xmark className="h-4 w-4 text-error" />
                  )}
                </td>
                <td align="right">
                  {(() => {
                    if (isActionDisabled) {
                      return null;
                    }

                    if (isCurrentDateAlreadyBookedByMe) {
                      return (
                        <div className="flex gap-2 text-warning">
                          <WarningTriangle />
                          You are already mentoring another student on this date
                        </div>
                      );
                    }

                    if (isMySession) {
                      return (
                        <div className="flex items-center justify-end gap-6">
                          <Link
                            to={`/mentor/sessions/${mentorIdForSessionForSelectedStudent!.sessionId}`}
                            className="btn btn-info w-36"
                          >
                            <StatsReport className="h-6 w-6" />
                            Report
                          </Link>
                          <button
                            className="btn btn-error w-28"
                            onClick={removeMentorForSession(
                              mentorIdForSessionForSelectedStudent!.sessionId,
                            )}
                          >
                            <WarningTriangle className="h-6 w-6" />
                            Cancel
                          </button>
                        </div>
                      );
                    }

                    if (isSessionBookedByPartner) {
                      return (
                        <button
                          className="btn btn-warning w-28"
                          onClick={stealSessionFromPartner(
                            mentorIdForSessionForSelectedStudent!.sessionId,
                            userId,
                          )}
                        >
                          <WarningTriangle className="h-6 w-6" />
                          Steal
                        </button>
                      );
                    }

                    return (
                      <button
                        className="btn btn-success w-28"
                        onClick={assignMentorForSession(
                          userId,
                          chapterId,
                          student.id,
                          attendedOn,
                        )}
                      >
                        <BookmarkBook className="h-6 w-6" />
                        Book
                      </button>
                    );
                  })()}
                  {isMySession && hasReport && (
                    <div className="badge gap-2 p-5 text-success">
                      <Check className="h-6 w-6" />
                      Report completed
                    </div>
                  )}
                  {isMySession && isCancelled && (
                    <div className="badge gap-2 p-5 text-error">
                      <WarningTriangle className="h-6 w-6" />
                      Session cancelled
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
