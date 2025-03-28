import type { LoaderFunctionArgs } from "react-router";

import dayjs from "dayjs";
import { Link, useLoaderData } from "react-router";

import { StatsReport, Check, Xmark, WarningTriangle } from "iconoir-react";

import {
  getLoggedUserInfoAsync,
  getSchoolTermsAsync,
} from "~/services/.server";
import { getCurrentTermForDate } from "~/services";
import { SubTitle } from "~/components";

import {
  getNextStudentSessionsAsync,
  getStudentSessionsAsync,
  getUserByAzureADIdAsync,
  hasAnyStudentsAssignedAsync,
} from "./services.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);
  const user = await getUserByAzureADIdAsync(loggedUser.oid);

  const terms = await getSchoolTermsAsync();
  const currentTerm = getCurrentTermForDate(terms, new Date());

  const hasAnyStudentsAssigned = await hasAnyStudentsAssignedAsync(user.id);
  if (!hasAnyStudentsAssigned) {
    return {
      currentTermLabel: `${currentTerm.name} (${currentTerm.start.format("D MMMM")} - ${currentTerm.end.format("D MMMM")})`,
      hasAnyStudentsAssigned,
      mentorFullName: user.fullName,
      nextStudentSessions: [],
      studentSessions: [],
    };
  }

  const nextStudentSessions = await getNextStudentSessionsAsync(
    user.id,
    user.chapterId,
    currentTerm,
  );
  const studentSessions = await getStudentSessionsAsync(
    user.id,
    user.chapterId,
    currentTerm,
  );

  return {
    currentTermLabel: `${currentTerm.name} (${currentTerm.start.format("D MMMM")} - ${currentTerm.end.format("D MMMM")})`,
    hasAnyStudentsAssigned: true,
    mentorFullName: user.fullName,
    nextStudentSessions,
    studentSessions,
  };
}

export default function Index() {
  const {
    currentTermLabel,
    mentorFullName,
    nextStudentSessions,
    studentSessions,
    hasAnyStudentsAssigned,
  } = useLoaderData<typeof loader>();

  return (
    <div className="-m-4 h-full p-4">
      <article className="prose relative mb-4 h-24 max-w-none lg:h-28">
        <div className="bg-achievers h-24 w-full rounded-md opacity-75 lg:h-28"></div>
        <h1 className="absolute top-6 left-6 hidden lg:block">
          Welcome {mentorFullName} - {currentTermLabel}
        </h1>
        <h2 className="absolute top-0 mt-0 p-4 lg:hidden">
          Welcome {mentorFullName}
        </h2>
      </article>

      {nextStudentSessions.length > 0 && (
        <>
          <SubTitle>Next sessions</SubTitle>

          <div className="overflow-auto bg-white">
            <table className="table-lg mb-4 table">
              <thead>
                <tr>
                  <th className="hidden w-6 lg:table-cell">#</th>
                  <th align="left">Session date</th>
                  <th align="left">Student</th>
                </tr>
              </thead>
              <tbody>
                {nextStudentSessions.map(
                  ({ id, attendedOn, studentFullName }) => (
                    <tr key={id} className="text-info">
                      <td className="hidden border-r lg:table-cell">1</td>
                      <td align="left">{attendedOn}</td>
                      <td align="left">{studentFullName}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!hasAnyStudentsAssigned && (
        <article className="prose max-w-none">
          <h1 className="text-warning flex items-center gap-4">
            <WarningTriangle />
            You have no students assigned
          </h1>
          <h3>
            Please contact your chapter coordinator to get a student assigned
          </h3>
        </article>
      )}

      {nextStudentSessions.length === 0 &&
        hasAnyStudentsAssigned &&
        studentSessions.length === 0 && (
          <article className="prose max-w-none">
            <h1 className="text-warning flex items-center gap-4">
              <WarningTriangle />
              You haven&apos;t booked a session yet
            </h1>
            <h3>
              Go to the <Link to="/mentor/roster">roster page</Link> to book you
              first session
            </h3>
          </article>
        )}

      {hasAnyStudentsAssigned && studentSessions.length > 0 && (
        <>
          <SubTitle>Recent sessions</SubTitle>

          <div className="overflow-auto bg-white">
            <table className="table-lg table">
              <thead>
                <tr>
                  <th className="hidden w-6 lg:table-cell">#</th>
                  <th align="left">Session date</th>
                  <th align="left">Student</th>
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
                {studentSessions.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <i>No sessions</i>
                    </td>
                  </tr>
                )}
                {studentSessions.map(
                  (
                    { id, completedOn, signedOffOn, student, session },
                    index,
                  ) => (
                    <tr key={id}>
                      <td className="hidden border-r lg:table-cell">
                        {index + 1}
                      </td>
                      <td align="left">
                        {dayjs(session.attendedOn).format("MMMM D, YYYY")}
                      </td>
                      <td align="left">{student.fullName}</td>
                      <td align="left" className="hidden lg:table-cell">
                        {completedOn ? (
                          <div className="flex items-center gap-2">
                            <Check className="text-success h-4 w-4" />
                            {dayjs(completedOn).format("MMMM D, YYYY")}
                          </div>
                        ) : (
                          <Xmark className="text-error h-4 w-4" />
                        )}
                      </td>
                      <td align="left" className="hidden lg:table-cell">
                        {signedOffOn ? (
                          <div className="flex items-center gap-2">
                            <Check className="text-success h-4 w-4" />
                            {dayjs(signedOffOn).format("MMMM D, YYYY")}
                          </div>
                        ) : (
                          <Xmark className="text-error h-4 w-4" />
                        )}
                      </td>
                      <td align="right">
                        {student && (
                          <Link
                            to={
                              completedOn !== null
                                ? `/mentor/student-sessions/${id}?back_url=/mentor/home`
                                : `/mentor/write-report?selectedStudentId=${student.id}&selectedTermDate=${dayjs(session.attendedOn).format("YYYY-MM-DD")}T00:00:00.000Z&back_url=/mentor/home`
                            }
                            className="btn btn-success btn-xs h-9 gap-2"
                          >
                            <StatsReport className="hidden h-4 w-4 lg:block" />
                            Report
                          </Link>
                        )}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
