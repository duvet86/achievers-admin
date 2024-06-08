import type { SessionLookup } from "../services.server";

import { useFetcher } from "@remix-run/react";
import classNames from "classnames";
import dayjs from "dayjs";

import {
  Group,
  BookmarkBook,
  Check,
  WarningTriangle,
  ThumbsUp,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { state, submit } = (useFetcher as any)();

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
          action: "assign",
        },
        {
          method: "POST",
          encType: "application/json",
        },
      );
    };

  const removeMentorForSession = (sessionId: number) => () => {
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
        <tbody>
          {datesInTerm.map((attendedOn, index) => {
            const mentorIdForSessionForSelectedStudent =
              sessionDateToMentorIdForStudentLookup[attendedOn];

            const mentorId = mentorIdForSessionForSelectedStudent?.userId;

            const isMySession = mentorId === userId;
            const mentorName = mentorId
              ? mentorIdToMentorNameForStudentLookup[mentorId]
              : undefined;
            const isSessionBookedByMe =
              sessionDateToMentorIdForAllStudentsLookup[attendedOn]?.userId ===
              userId;

            const hasReport = mentorIdForSessionForSelectedStudent?.hasReport;
            const isCancelled =
              mentorIdForSessionForSelectedStudent?.isCancelled;

            const enableActions = hasReport === false && isCancelled === false;

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
                  ) : mentorName ? (
                    <div className="flex gap-2 text-info">
                      <Group />
                      {`${mentorName} (Partner)`}
                    </div>
                  ) : isSessionBookedByMe ? (
                    <div className="flex gap-2 text-warning">
                      <WarningTriangle />
                      You are already mentoring another student
                    </div>
                  ) : (
                    <div className="flex gap-2 text-success">
                      <Check />
                      Available
                    </div>
                  )}
                </td>
                <td align="right">
                  {enableActions &&
                    (isMySession ? (
                      <button
                        className="btn btn-error w-28"
                        onClick={removeMentorForSession(
                          mentorIdForSessionForSelectedStudent!.sessionId,
                        )}
                      >
                        <WarningTriangle className="h-6 w-6" />
                        Cancel
                      </button>
                    ) : (
                      !mentorName && (
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
                      )
                    ))}
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
