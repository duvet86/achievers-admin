import { useFetcher } from "@remix-run/react";
import dayjs from "dayjs";

import { Check, CheckCircle, WarningTriangle } from "iconoir-react";

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
      sessionDate: string,
    ) =>
    () => {
      submit(
        {
          chapterId,
          studentId,
          userId,
          attendedOn: sessionDate,
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
      sessionDate: string,
    ) =>
    () => {
      submit(
        {
          chapterId,
          studentId,
          userId,
          attendedOn: sessionDate,
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
      <table className="table table-pin-rows">
        <tbody>
          {datesInTerm.map((sessionDate, index) => {
            const mentorIdForSessionForSelectedStudent =
              sessionDateToMentorIdForStudentLookup[sessionDate];
            const isMySession = mentorIdForSessionForSelectedStudent === userId;
            const mentorName =
              mentorIdToMentorNameForStudentLookup[
                mentorIdForSessionForSelectedStudent
              ];
            const isSessionBookedByMe =
              sessionDateToMentorIdForAllStudentsLookup[sessionDate] === userId;

            return (
              <tr key={index}>
                <td className="w-1/6 border-r font-medium text-gray-800">
                  <div className="flex flex-col">
                    <span>{dayjs(sessionDate).format("dddd")}</span>
                    <span>{dayjs(sessionDate).format("DD/MM/YYYY")}</span>
                  </div>
                </td>
                <td>
                  {isMySession ? (
                    <div className="flex gap-2 text-success">
                      <CheckCircle />
                      {`${mentorName} (Me)`}
                    </div>
                  ) : mentorIdToMentorNameForStudentLookup[
                      mentorIdForSessionForSelectedStudent
                    ] ? (
                    <div className="flex gap-2 text-info">
                      <Check />
                      {`${mentorName} (Partner)`}
                    </div>
                  ) : isSessionBookedByMe ? (
                    <div className="flex gap-2 text-error">
                      <WarningTriangle />
                      Session already booked
                    </div>
                  ) : (
                    <div className="flex gap-2 text-warning">
                      <WarningTriangle />
                      No mentors assigned
                    </div>
                  )}
                </td>
                <td align="right">
                  {isMySession ? (
                    <button
                      className="btn btn-error btn-sm w-36"
                      onClick={removeMentorForSession(
                        userId,
                        chapterId,
                        student.id,
                        sessionDate,
                      )}
                    >
                      <WarningTriangle className="h-4 w-4" />
                      Remove
                    </button>
                  ) : (
                    !isSessionBookedByMe &&
                    !mentorName && (
                      <button
                        className="btn btn-success btn-sm w-36"
                        onClick={assignMentorForSession(
                          userId,
                          chapterId,
                          student.id,
                          sessionDate,
                        )}
                      >
                        <Check className="h-4 w-4" />
                        Assign to me
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
