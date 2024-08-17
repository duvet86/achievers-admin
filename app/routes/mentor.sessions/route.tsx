import type { LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";

import dayjs from "dayjs";
import { Check, StatsReport, Xmark } from "iconoir-react";

import { getDatesForTerm } from "~/services";
import { getLoggedUserInfoAsync } from "~/services/.server";
import { Select, Title } from "~/components";

import {
  getSessionsAsync,
  getAssignedStudentsAsync,
  getUserByAzureADIdAsync,
  getSchoolTermsForYearAsync,
  getCurrentTermForDate,
  SessionViewModel,
} from "./services.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const selectedTerm = url.searchParams.get("selectedTerm");
  const studentId = Number(url.searchParams.get("studentId"));

  const loggedUser = await getLoggedUserInfoAsync(request);
  const user = await getUserByAzureADIdAsync(loggedUser.oid);

  const students = await getAssignedStudentsAsync(user.id);

  const terms = await getSchoolTermsForYearAsync(dayjs().year());

  const currentTerm =
    terms.find((t) => t.name === selectedTerm) ??
    getCurrentTermForDate(terms, new Date());

  const selectedStudentId: number | undefined =
    students.find(({ id }) => id === studentId)?.id ?? students[0]?.id;

  const termsList = terms.map(({ start, end, name }) => ({
    value: name,
    label: `${name} (${start.format("D MMMM")} - ${end.format("D MMMM")})`,
  }));

  if (selectedStudentId === undefined) {
    return json({
      currentTerm: currentTerm.name,
      termsList,
      datesInTerm: [],
      selectedStudentId,
      students: [],
      sesionsLookup: {} as Record<string, SessionViewModel>,
      range: [],
      count: 0,
      currentPageNumber: 0,
    });
  }

  const sessions = await getSessionsAsync(
    user.id,
    selectedStudentId,
    currentTerm.start.toDate(),
    currentTerm.end.toDate(),
  );

  const sesionsLookup = sessions.reduce<Record<string, SessionViewModel>>(
    (res, value) => {
      res[value.attendedOn.toISOString()] = value;

      return res;
    },
    {},
  );

  return json({
    currentTerm: currentTerm.name,
    termsList,
    datesInTerm: getDatesForTerm(currentTerm.start, currentTerm.end),
    selectedStudentId: selectedStudentId.toString(),
    students,
    sesionsLookup,
  });
}

export default function Index() {
  const {
    currentTerm,
    termsList,
    datesInTerm,
    selectedStudentId,
    students,
    sesionsLookup,
  } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  return (
    <>
      <Title>Sessions/Reports</Title>

      <div className="mb-6 mt-2 hidden flex-wrap items-end justify-between gap-4 lg:flex">
        <Select
          label="Select a term"
          name="selectedTerm"
          defaultValue={searchParams.get("selectedTerm") ?? currentTerm}
          options={termsList}
        />

        <Select
          label="Select a student"
          name="studentId"
          defaultValue={selectedStudentId}
          options={students.map(({ id, fullName }) => ({
            label: fullName,
            value: id.toString(),
          }))}
        />
      </div>

      <div className="overflow-auto bg-white">
        <table className="table table-lg">
          <thead>
            <tr>
              <th className="w-6">#</th>
              <th align="left">Session date</th>
              <th align="left">Report completed</th>
              <th align="left">Signed off</th>
              <th align="right">Action</th>
            </tr>
          </thead>
          <tbody>
            {datesInTerm.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <i>No sessions</i>
                </td>
              </tr>
            )}
            {datesInTerm.map((sessionDate, index) => (
              <tr key={sessionDate}>
                <td className="border-r">{index + 1}</td>
                <td align="left">
                  {dayjs(sessionDate).format("MMMM D, YYYY")}
                </td>
                <td align="left">
                  {sesionsLookup[sessionDate]?.completedOn ? (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      {dayjs(sesionsLookup[sessionDate].completedOn).format(
                        "MMMM D, YYYY",
                      )}
                    </div>
                  ) : (
                    <Xmark className="h-4 w-4 text-error" />
                  )}
                </td>
                <td align="left">
                  {sesionsLookup[sessionDate]?.signedOffOn ? (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      {dayjs(sesionsLookup[sessionDate].signedOffOn).format(
                        "MMMM D, YYYY",
                      )}
                    </div>
                  ) : (
                    <Xmark className="h-4 w-4 text-error" />
                  )}
                </td>
                <td align="right">
                  {sesionsLookup[sessionDate] && (
                    <Link
                      to={`/mentor/sessions/${sesionsLookup[sessionDate].id}`}
                      className="btn btn-success btn-xs h-8 gap-2"
                    >
                      <StatsReport className="hidden h-4 w-4 lg:block" />
                      View report
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
