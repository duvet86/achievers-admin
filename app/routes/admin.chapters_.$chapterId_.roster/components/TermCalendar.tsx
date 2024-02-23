import { Link, useFetcher } from "@remix-run/react";
import dayjs from "dayjs";

import { Check, WarningCircle } from "iconoir-react";

import { getValueFromCircularArray } from "~/services";

interface Props {
  chapterId: string;
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

const colours = ["#FAD7A0", "#A9DFBF", "#FADBD8", "#AED6F1"];

export default function TermCalendar({
  chapterId,
  datesInTerm,
  students,
}: Props) {
  const { state, submit } = useFetcher();

  const isLoading = state === "loading";

  const onSessionSubmit =
    (studentId: number, attendedOn: string) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      submit(
        {
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
    <div className="relative overflow-auto">
      {isLoading && (
        <div className="absolute z-30 flex h-full w-full justify-center bg-slate-300 bg-opacity-50">
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
                id,
                firstName,
                lastName,
                mentorToStudentAssignement,
                sessionLookup,
              },
              i,
            ) => (
              <tr
                key={id}
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
                    to={`/admin/chapters/${chapterId}/students/${id}`}
                    className="link block w-36"
                  >
                    {firstName} {lastName}
                  </Link>
                </th>
                {datesInTerm.map((attendedOn, index) => (
                  <td key={index}>
                    <div className="indicator">
                      <select
                        className="select w-48"
                        onChange={onSessionSubmit(id, attendedOn)}
                        defaultValue={sessionLookup[attendedOn] ?? ""}
                      >
                        <option disabled value=""></option>
                        {mentorToStudentAssignement.map(
                          ({ user: { id, firstName, lastName } }) => (
                            <option key={id} value={id}>
                              {firstName} {lastName}
                            </option>
                          ),
                        )}
                      </select>
                      {sessionLookup[attendedOn] ? (
                        <Check className="badge indicator-item bg-success" />
                      ) : (
                        <WarningCircle className="badge indicator-item bg-error" />
                      )}
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
