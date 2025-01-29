import type { LoaderFunctionArgs } from "react-router";

import dayjs from "dayjs";
import { Link, useLoaderData } from "react-router";

import {
  StatsReport,
  Check,
  Xmark,
  InfoCircle,
  WarningTriangle,
} from "iconoir-react";

import { getLoggedUserInfoAsync } from "~/services/.server";
import { SubTitle } from "~/components";

import {
  getNextStudentSessionAsync,
  getStudentSessionsAsync,
  getUserByAzureADIdAsync,
  hasAnyStudentsAssignedAsync,
} from "./services.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);
  const user = await getUserByAzureADIdAsync(loggedUser.oid);

  const hasAnyStudentsAssigned = await hasAnyStudentsAssignedAsync(user.id);
  if (!hasAnyStudentsAssigned) {
    return {
      hasAnyStudentsAssigned,
      mentorFullName: user.fullName,
      nextStudentSessionDate: null,
      student: null,
      studentSessions: [],
    };
  }

  const nextStudentSession = await getNextStudentSessionAsync(
    user.id,
    user.chapterId,
  );
  const studentSessions = await getStudentSessionsAsync(
    user.id,
    user.chapterId,
  );

  return {
    hasAnyStudentsAssigned: true,
    mentorFullName: user.fullName,
    nextStudentSessionDate:
      nextStudentSession !== null
        ? dayjs(nextStudentSession.session.attendedOn).format("MMMM D, YYYY")
        : null,
    student: nextStudentSession !== null ? nextStudentSession.student : null,
    studentSessions,
  };
}

export default function Index() {
  const {
    mentorFullName,
    nextStudentSessionDate,
    student,
    studentSessions,
    hasAnyStudentsAssigned,
  } = useLoaderData<typeof loader>();

  return (
    <div className="-m-4 h-full p-4">
      <article className="prose relative mb-4 h-24 max-w-none lg:h-28">
        <div className="bg-achievers h-24 w-full rounded-md opacity-75 lg:h-28"></div>
        <h1 className="absolute top-6 left-6 hidden lg:block">
          Welcome {mentorFullName}
        </h1>
        <h2 className="absolute top-0 mt-0 p-4 lg:hidden">
          Welcome {mentorFullName}
        </h2>
      </article>

      {student && nextStudentSessionDate && (
        <>
          <SubTitle>Next session</SubTitle>

          <div className="mb-8 flex items-center gap-4 rounded-sm bg-slate-100 p-4">
            <InfoCircle className="blink text-primary h-12 w-12" />

            <div className="flex flex-col gap-4 font-bold lg:flex-row lg:items-end">
              <span className="text-4xl">{nextStudentSessionDate}</span>
              <span>with</span>
              <span className="text-3xl">{student.fullName}</span>
            </div>
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
            Please contact your chapter coordinator to get a stundent assigned
          </h3>
        </article>
      )}

      {nextStudentSessionDate === null &&
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
                      <td className="hidden border-r border-gray-300 lg:table-cell">
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
