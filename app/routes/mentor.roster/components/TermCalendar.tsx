import { useFetcher } from "@remix-run/react";
import dayjs from "dayjs";

import { Check, WarningCircle } from "iconoir-react";

interface Props {
  chapterId: number;
  datesInTerm: string[];
  students: {
    sessionLookup: Record<string, number>;
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

export default function TermCalendar({
  chapterId,
  datesInTerm,
  students,
}: Props) {
  const { state, submit } = useFetcher();

  const isLoading = state === "loading";

  const onSessionSubmit =
    (chapterId: number, studentId: number, sessionDate: string) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      submit(
        {
          chapterId,
          studentId,
          userId: e.target.value,
          attendOn: sessionDate,
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
        <div className="absolute z-30 flex h-full w-full justify-center bg-slate-300 bg-opacity-50">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      )}
      <table className="table table-pin-rows table-pin-cols">
        <thead>
          <tr className="z-20">
            <th className="border-r">Students</th>
            {datesInTerm.map((sessionDate, index) => (
              <td key={index} className="h-16">
                <div className="flex flex-col items-center font-medium text-gray-800">
                  <span>{dayjs(sessionDate).format("dddd")}</span>
                  <span>{dayjs(sessionDate).format("DD/MM/YYYY")}</span>
                </div>
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map(
            (
              {
                id,
                firstName,
                lastName,
                mentorToStudentAssignement,
                sessionLookup,
              },
              i,
            ) => (
              <tr key={id}>
                <th className="z-10 border-r">
                  {firstName} {lastName}
                </th>
                {datesInTerm.map((sessionDate, index) => (
                  <td key={index} className="h-16">
                    <div className="indicator">
                      <label>
                        <select
                          className="select"
                          onChange={onSessionSubmit(chapterId, id, sessionDate)}
                          defaultValue={sessionLookup[sessionDate]}
                        >
                          <option disabled selected></option>
                          {mentorToStudentAssignement.map(
                            ({ user: { id, firstName, lastName } }) => (
                              <option key={id} value={id}>
                                {firstName} {lastName}
                              </option>
                            ),
                          )}
                        </select>
                        {sessionLookup[sessionDate] ? (
                          <Check className="badge indicator-item bg-success" />
                        ) : (
                          <WarningCircle className="badge indicator-item bg-error" />
                        )}
                      </label>
                    </div>
                  </td>
                ))}
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}
