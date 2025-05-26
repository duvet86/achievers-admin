import type { Route } from "./+types/route";

import dayjs from "dayjs";
import { StatsReport, Check, Xmark, WarningTriangle } from "iconoir-react";

import {
  getLoggedUserInfoAsync,
  getSchoolTermsAsync,
} from "~/services/.server";
import { getCurrentTermForDate } from "~/services";
import { StateLink, SubTitle } from "~/components";

import {
  getNextMentorSessionsAsync,
  getSessionsAsync,
  getUserByAzureADIdAsync,
  hasAnyStudentsAssignedAsync,
} from "./services.server";

export async function loader({ request }: Route.LoaderArgs) {
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
      nextMentorSessions: [],
      sessions: [],
    };
  }

  const nextMentorSessions = await getNextMentorSessionsAsync(
    user.id,
    user.chapterId,
    currentTerm,
  );
  const sessions = await getSessionsAsync(user.id, user.chapterId, currentTerm);

  return {
    currentTermLabel: `${currentTerm.name} (${currentTerm.start.format("D MMMM")} - ${currentTerm.end.format("D MMMM")})`,
    hasAnyStudentsAssigned: true,
    mentorFullName: user.fullName,
    nextMentorSessions,
    sessions,
  };
}

export default function Index({
  loaderData: {
    currentTermLabel,
    mentorFullName,
    nextMentorSessions,
    sessions,
    hasAnyStudentsAssigned,
  },
}: Route.ComponentProps) {
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

      {nextMentorSessions.length > 0 && (
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
                {nextMentorSessions.map(
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

      {nextMentorSessions.length === 0 &&
        hasAnyStudentsAssigned &&
        sessions.length === 0 && (
          <article className="prose max-w-none">
            <h1 className="text-warning flex items-center gap-4">
              <WarningTriangle />
              You haven&apos;t booked a session yet
            </h1>
            <h3>
              Go to the <StateLink to="/mentor/roster">roster page</StateLink>{" "}
              to book you first session
            </h3>
          </article>
        )}

      {hasAnyStudentsAssigned && sessions.length > 0 && (
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
                {sessions.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <i>No sessions</i>
                    </td>
                  </tr>
                )}
                {sessions.map(
                  (
                    {
                      sessionId,
                      attendedOn,
                      completedOn,
                      signedOffOn,
                      studentId,
                      studentFullName,
                    },
                    index,
                  ) => (
                    <tr key={sessionId}>
                      <td className="hidden border-r lg:table-cell">
                        {index + 1}
                      </td>
                      <td align="left">
                        {dayjs(attendedOn).format("MMMM D, YYYY")}
                      </td>
                      <td align="left">{studentFullName}</td>
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
                        <StateLink
                          to={
                            completedOn !== null
                              ? `/mentor/sessions/${sessionId}` // FIX ME.
                              : `/mentor/write-report?selectedStudentId=${studentId}&selectedTermDate=${dayjs(attendedOn).format("YYYY-MM-DD")}T00:00:00.000Z`
                          }
                          className="btn btn-success btn-xs h-9 gap-2"
                        >
                          <StatsReport className="hidden h-4 w-4 lg:block" />
                          Report
                        </StateLink>
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
