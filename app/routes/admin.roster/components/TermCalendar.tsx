import type { SessionCheckboxState } from "../services.server";

import { useFetcher } from "@remix-run/react";
import dayjs from "dayjs";

import { getValueFromCircularArray } from "~/services";

interface Props {
  datesInTerm: string[];
  studentsLookupInit: Record<
    string,
    Record<string, Record<string, SessionCheckboxState>>
  >;
  mentors: {
    firstName: string;
    lastName: string;
    frequencyInDays: number | null;
    mentorToStudentAssignement: {
      studentId: number;
      userId: number;
      student: {
        firstName: string;
        lastName: string;
      };
    }[];
  }[];
  students: {
    mentorId: number;
    studentId: number;
    userId: number;
    student: {
      firstName: string;
      lastName: string;
    };
  }[];
}

const colours = ["#FAD7A0", "#A9DFBF", "#FADBD8", "#AED6F1"];

export default function TermCalendar({
  datesInTerm,
  mentors,
  studentsLookupInit: studentsLookup,
  students,
}: Props) {
  const { state, submit } = useFetcher();

  const isLoading = state === "loading";

  const onSessionSubmit =
    (studentId: string, userId: string, sessionDate: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      submit(
        {
          studentId,
          userId,
          attendOn: sessionDate,
          checked: e.target.checked,
        },
        {
          method: e.target.checked ? "POST" : "DELETE",
          encType: "application/json",
        },
      );
    };

  return (
    <fieldset className="relative flex rounded shadow" disabled={isLoading}>
      {isLoading && (
        <div className="absolute z-20 flex h-full w-full justify-center bg-slate-300 bg-opacity-50">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      )}

      <div className="flex shrink-0 basis-1/3 flex-col">
        <div className="flex h-16 border-b border-r text-sm">
          <div className="h-full w-1/2 border-r p-4">
            <div className="font-bold">Mentors</div>
            <div className="text-xs italic">(Preferrend frequency)</div>
          </div>
          <div className="h-full w-1/2 p-4 font-bold">Students</div>
        </div>

        <div className="border-r">
          {mentors.map(
            (
              {
                firstName,
                lastName,
                frequencyInDays,
                mentorToStudentAssignement,
              },
              i,
            ) => (
              <div
                key={i}
                className="flex text-sm"
                style={{
                  backgroundColor: getValueFromCircularArray(i, colours),
                }}
              >
                <div className="w-1/2 border-b border-r p-2">
                  <div className="font-bold">
                    {firstName} {lastName}
                  </div>
                  <div className="text-xs italic">
                    {frequencyInDays === 7 ? "(Weekly)" : "(Fortnightly)"}
                  </div>
                </div>
                <div className="flex w-1/2 flex-col">
                  {mentorToStudentAssignement.map(
                    ({ student: { firstName, lastName } }, ii) => (
                      <div
                        key={ii}
                        className="h-16 overflow-hidden text-ellipsis whitespace-nowrap border-b p-2 font-bold"
                      >
                        {firstName} {lastName}
                      </div>
                    ),
                  )}
                </div>
              </div>
            ),
          )}
        </div>
      </div>

      {datesInTerm.map((sessionDate, index) => (
        <div key={index} className="flex w-full flex-col">
          <div className="flex h-16 items-center justify-center border-b border-r p-2 text-sm">
            <div className="flex flex-col items-center font-medium text-gray-800">
              <span>{dayjs(sessionDate).format("dddd")}</span>
              <span>{dayjs(sessionDate).format("DD/MM/YYYY")}</span>
            </div>
          </div>

          {students.map(({ studentId, userId, mentorId }, i) => (
            <div
              key={i}
              className="flex h-16 items-center justify-center border-b border-r"
              style={{
                backgroundColor: getValueFromCircularArray(mentorId, colours),
              }}
            >
              <input
                type="checkbox"
                className="checkbox bg-white"
                checked={studentsLookup[studentId][sessionDate][userId].checked}
                disabled={
                  studentsLookup[studentId][sessionDate][userId].disabled
                }
                onChange={onSessionSubmit(
                  studentId.toString(),
                  userId.toString(),
                  sessionDate,
                )}
              />
            </div>
          ))}
        </div>
      ))}
    </fieldset>
  );
}
