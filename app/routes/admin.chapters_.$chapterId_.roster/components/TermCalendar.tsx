import type { SessionLookup } from "../services.server";

import { Link, useFetcher } from "@remix-run/react";
import dayjs from "dayjs";
import { Check, WarningTriangle } from "iconoir-react";

import { getValueFromCircularArray } from "~/services";

interface Props {
  chapterId: string;
  datesInTerm: string[];
  students: {
    sessionLookup: SessionLookup;
    id: number;
    firstName: string;
    lastName: string;
    mentorToStudentAssignement: {
      user: {
        id: number;
        firstName: string;
        lastName: string;
      };
    }[];
  }[];
}

const colours = ["#FAD7A0", "#A9DFBF", "#FADBD8", "#AED6F1"];

export default function TermCalendar({
  chapterId,
  datesInTerm,
  students,
}: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { state, submit } = (useFetcher as any)();

  const isLoading = state === "loading";

  const onMentorSelect =
    (sessionId: number | undefined, studentId: number, attendedOn: string) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      submit(
        {
          sessionId,
          studentId,
          userId: e.target.value,
          attendedOn,
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

      <table className="table table-pin-rows table-pin-cols">
        <thead>
          <tr className="z-20">
            <th className="border-r">Students</th>
            {datesInTerm.map((attendedOn, index) => (
              <td key={index}>
                <div className="flex flex-col items-center font-medium text-gray-800">
                  <span>{dayjs(attendedOn).format("dddd")}</span>
                  <span>{dayjs(attendedOn).format("DD/MM/YYYY")}</span>
                </div>
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map(
            (
              {
                id: studentId,
                firstName: studentFirstName,
                lastName: studentLastName,
                mentorToStudentAssignement,
                sessionLookup,
              },
              i,
            ) => (
              <tr
                key={studentId}
                style={{
                  backgroundColor: getValueFromCircularArray(i, colours),
                }}
              >
                <th
                  className="z-10 border-r"
                  style={{
                    backgroundColor: getValueFromCircularArray(i, colours),
                  }}
                >
                  <Link
                    to={`/admin/chapters/${chapterId}/students/${studentId}`}
                    className="link block w-36"
                  >
                    {studentFirstName} {studentLastName}
                  </Link>
                </th>
                {datesInTerm.map((attendedOn, index) => {
                  const sessionInfo = sessionLookup[attendedOn];

                  const sessionId = sessionInfo?.sessionId;
                  const hasReport = sessionInfo?.hasReport ?? false;
                  const isCancelled = sessionInfo?.isCancelled ?? false;

                  return (
                    <td key={index}>
                      <div className="indicator">
                        <select
                          name="mentorId"
                          className="roster-select select w-48"
                          onChange={onMentorSelect(
                            sessionId,
                            studentId,
                            attendedOn,
                          )}
                          defaultValue={sessionLookup[attendedOn]?.userId ?? ""}
                          disabled={hasReport || isCancelled}
                        >
                          <option disabled value=""></option>
                          {mentorToStudentAssignement.map(
                            ({
                              user: {
                                id: mentorId,
                                firstName: mentorFirstName,
                                lastName: mentorLastName,
                              },
                            }) => (
                              <option key={mentorId} value={mentorId}>
                                {mentorFirstName} {mentorLastName}
                              </option>
                            ),
                          )}
                        </select>
                        {sessionInfo && !isCancelled && !hasReport && (
                          <div className="indicator-item">
                            <Link
                              className="btn btn-outline btn-error btn-xs font-bold"
                              to={`/admin/chapters/${chapterId}/sessions/${sessionId}/cancel`}
                            >
                              Cancel
                            </Link>
                          </div>
                        )}
                        {isCancelled && (
                          <div className="badge indicator-item badge-error indicator-center gap-1">
                            Cancelled <WarningTriangle className="h-4 w-4" />
                          </div>
                        )}
                        {hasReport && (
                          <div className="badge indicator-item badge-success indicator-center gap-1">
                            Report <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}
