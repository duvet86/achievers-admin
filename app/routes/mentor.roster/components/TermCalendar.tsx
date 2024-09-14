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

            const isCancelled =
              mentorIdForSessionForSelectedStudent?.isCancelled;
            const completedOn =
              mentorIdForSessionForSelectedStudent?.completedOn;
            const signedOffOn =
              mentorIdForSessionForSelectedStudent?.signedOffOn;

            return (
              <tr key={index}>
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
                  {completedOn ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Xmark className="h-4 w-4 text-error" />
                  )}
                </td>
                <td className="hidden lg:table-cell">
                  {signedOffOn ? (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      {dayjs(signedOffOn).format("MMMM D, YYYY")}
                    </div>
                  ) : (
                    <Xmark className="h-4 w-4 text-error" />
                  )}
                </td>
                <td align="right">
                  {(() => {
                    if (isCancelled) {
                      return (
                        <div className="badge gap-2 p-5 text-error">
                          <WarningTriangle className="h-6 w-6" />
                          Session cancelled
                        </div>
                      );
                    }

                    if (isCurrentDateAlreadyBookedByMe) {
                      return (
                        <div className="flex gap-2 text-warning">
                          <WarningTriangle />
                          You are already mentoring another student on this date
                        </div>
                      );
                    }

                    if (isMySession || completedOn) {
                      return (
                        <div className="flex items-center justify-end gap-6">
                          <Link
                            to={`/mentor/reports?selectedStudentId=${student.id}&selectedTermDate=${dayjs(attendedOn).format("YYYY-MM-DD")}T00:00:00Z&back_url=/mentor/roster`}
                            className={classNames("btn", {
                              "btn-warning w-40": !completedOn,
                              // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                              "btn-info w-36": completedOn || signedOffOn,
                            })}
                          >
                            <StatsReport className="h-6 w-6" />
                            {completedOn || signedOffOn
                              ? "View Report"
                              : "Write Report"}
                          </Link>
                          {!completedOn && (
                            <button
                              className="btn btn-error w-36"
                              onClick={removeMentorForSession(
                                mentorIdForSessionForSelectedStudent!.sessionId,
                              )}
                            >
                              <WarningTriangle className="h-6 w-6" />
                              Cancel
                            </button>
                          )}
                        </div>
                      );
                    }

                    if (isSessionBookedByPartner) {
                      return (
                        <button
                          className="btn btn-warning w-36"
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
                        className="btn btn-success w-36"
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
