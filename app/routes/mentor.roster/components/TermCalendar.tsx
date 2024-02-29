import { useFetcher } from "@remix-run/react";
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
    sessionDateToMentorIdForStudentLookup: Record<string, number>;
    mentorIdToMentorNameForStudentLookup: Record<string, string>;
    id: number;
    firstName: string;
    lastName: string;
  };
  sessionDateToMentorIdForAllStudentsLookup: Record<string, number>;
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
          action: "assign",
        },
        {
          method: "POST",
          encType: "application/json",
        },
      );
    };

  const removeMentorForSession =
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
          action: "remove",
        },
        {
          method: "POST",
          encType: "application/json",
        },
      );
    };

  return (
    <div className="relative overflow-auto">
      {isLoading && (
        <div className="absolute z-30 flex h-full w-full justify-center bg-slate-300 bg-opacity-50">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      )}
      <table className="table table-zebra table-pin-rows">
        <tbody>
          {datesInTerm.map((attendedOn, index) => {
            const mentorIdForSessionForSelectedStudent =
              sessionDateToMentorIdForStudentLookup[attendedOn];
            const isMySession = mentorIdForSessionForSelectedStudent === userId;
            const mentorName =
              mentorIdToMentorNameForStudentLookup[
                mentorIdForSessionForSelectedStudent
              ];
            const isSessionBookedByMe =
              sessionDateToMentorIdForAllStudentsLookup[attendedOn] === userId;

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
                  ) : mentorIdToMentorNameForStudentLookup[
                      mentorIdForSessionForSelectedStudent
                    ] ? (
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
                  {isMySession ? (
                    <button
                      className="btn btn-error w-28"
                      onClick={removeMentorForSession(
                        userId,
                        chapterId,
                        student.id,
                        attendedOn,
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
