import { useFetcher, useNavigate, useParams } from "@remix-run/react";
import dayjs from "dayjs";

import { Check, WarningCircle } from "iconoir-react";

import { getValueFromCircularArray } from "~/services";

interface Props {
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

export default function TermCalendar({ datesInTerm, students }: Props) {
  const { state, submit } = useFetcher();
  const navigate = useNavigate();
  const { chapterId } = useParams();

  const isLoading = state === "loading";

  const onSessionSubmit =
    (studentId: number, sessionDate: string) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (e.target.value === "assign-temp-mentor") {
        navigate(
          `/admin/chapters/${chapterId}/students/${studentId}/session/${sessionDate}`,
        );
      } else {
        submit(
          {
            studentId,
            userId: e.target.value,
            attendOn: sessionDate,
          },
          {
            method: "POST",
            encType: "application/json",
          },
        );
      }
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
                  {firstName} {lastName}
                </th>
                {datesInTerm.map((sessionDate, index) => (
                  <td key={index} className="h-16">
                    <div className="indicator">
                      <label>
                        <select
                          className="select"
                          onChange={onSessionSubmit(id, sessionDate)}
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
                          <option
                            className="italic text-info"
                            value="assign-temp-mentor"
                          >
                            Assign mentor
                          </option>
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
