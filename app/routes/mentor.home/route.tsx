import type { LoaderFunctionArgs, TypedResponse } from "@remix-run/node";

import dayjs from "dayjs";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

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
  getNextSessionAsync,
  getSessionsAsync,
  getUserByAzureADIdAsync,
  hasAnyStudentsAssignedAsync,
} from "./services.server";

export async function loader({ request }: LoaderFunctionArgs): Promise<
  TypedResponse<{
    hasAnyStudentsAssigned: boolean;
    mentorFullName: string;
    nextSessionDate: string | null;
    student: null | {
      id: number;
      fullName: string;
    };
    sessions: {
      id: number;
      attendedOn: Date;
      completedOn: Date | null;
      signedOffOn: Date | null;
      student: {
        id: number;
        fullName: string;
      };
    }[];
  }>
> {
  const loggedUser = await getLoggedUserInfoAsync(request);
  const user = await getUserByAzureADIdAsync(loggedUser.oid);

  const hasAnyStudentsAssigned = await hasAnyStudentsAssignedAsync(user.id);
  if (!hasAnyStudentsAssigned) {
    return json({
      hasAnyStudentsAssigned,
      mentorFullName: user.fullName,
      nextSessionDate: null,
      student: null,
      sessions: [],
    });
  }

  const nextSession = await getNextSessionAsync(user.id);
  const sessions = await getSessionsAsync(user.id, user.chapterId);

  return json({
    hasAnyStudentsAssigned: true,
    mentorFullName: user.fullName,
    nextSessionDate:
      nextSession !== null
        ? dayjs(nextSession.attendedOn).format("MMMM D, YYYY")
        : null,
    student: nextSession !== null ? nextSession.student : null,
    sessions,
  });
}

export default function Index() {
  const {
    mentorFullName,
    nextSessionDate,
    student,
    sessions,
    hasAnyStudentsAssigned,
  } = useLoaderData<typeof loader>();

  return (
    <div className="-m-4 h-full p-4">
      <article className="prose relative mb-4 h-24 max-w-none lg:h-28">
        <div className="h-24 w-full rounded-md bg-achievers opacity-75 lg:h-28"></div>
        <h1 className="absolute left-6 top-6 hidden lg:block">
          Welcome {mentorFullName}
        </h1>
        <h2 className="absolute top-0 mt-0 p-4 lg:hidden">
          Welcome {mentorFullName}
        </h2>
      </article>

      {student && nextSessionDate && (
        <>
          <SubTitle>Next session</SubTitle>

          <div className="mb-8 flex items-center gap-4 rounded bg-slate-100 p-4">
            <InfoCircle className="blink h-12 w-12 text-primary" />

            <div className="flex items-end gap-4 font-bold">
              <span className="text-4xl">{nextSessionDate}</span>
              <span>with</span>
              <span className="text-3xl">{student.fullName}</span>
            </div>
          </div>
        </>
      )}

      {!hasAnyStudentsAssigned && (
        <article className="prose max-w-none">
          <h1 className="flex items-center gap-4 text-warning">
            <WarningTriangle />
            You have no students assigned
          </h1>
          <h3>
            Please contact your chapter coordinator to get a stundent assigned
          </h3>
        </article>
      )}

      {hasAnyStudentsAssigned && sessions.length === 0 && (
        <article className="prose max-w-none">
          <h1 className="flex items-center gap-4 text-warning">
            <WarningTriangle />
            You haven't booked a session yet
          </h1>
          <h3>
            Go to the <Link to="/mentor/roster">Roster</Link> to book you first
            session
          </h3>
        </article>
      )}

      {hasAnyStudentsAssigned && sessions.length > 0 && (
        <>
          <SubTitle>Recent sessions</SubTitle>

          <div className="overflow-auto bg-white">
            <table className="table table-lg">
              <thead>
                <tr>
                  <th className="w-6">#</th>
                  <th align="left">Session date</th>
                  <th align="left">Student</th>
                  <th align="left">Report completed</th>
                  <th align="left">Signed off</th>
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
                    { id, attendedOn, completedOn, signedOffOn, student },
                    index,
                  ) => (
                    <tr key={id}>
                      <td className="border-r">{index + 1}</td>
                      <td align="left">
                        {dayjs(attendedOn).format("MMMM D, YYYY")}
                      </td>
                      <td align="left">{student.fullName}</td>
                      <td align="left">
                        {completedOn ? (
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-success" />
                            {dayjs(completedOn).format("MMMM D, YYYY")}
                          </div>
                        ) : (
                          <Xmark className="h-4 w-4 text-error" />
                        )}
                      </td>
                      <td align="left">
                        {signedOffOn ? (
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-success" />
                            {dayjs(signedOffOn).format("MMMM D, YYYY")}
                          </div>
                        ) : (
                          <Xmark className="h-4 w-4 text-error" />
                        )}
                      </td>
                      <td align="right">
                        <Link
                          to={`/mentor/reports?selectedStudentId=${student.id}&selectedTermDate=${dayjs(attendedOn).format("YYYY-MM-DD")}T00:00:00Z&back_url=/mentor/home`}
                          className="btn btn-success btn-xs h-8 gap-2"
                        >
                          <StatsReport className="hidden h-4 w-4 lg:block" />
                          View report
                        </Link>
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
