import type { LoaderFunctionArgs, TypedResponse } from "@remix-run/node";

import dayjs from "dayjs";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { StatsReport, Check, Xmark } from "iconoir-react";

import {
  getCurrentUserADIdAsync,
  getUserByAzureADIdAsync,
} from "~/services/.server";
import { SubTitle } from "~/components";

import { getNextSessionAsync, getSessionsAsync } from "./services.server";

export async function loader({ request }: LoaderFunctionArgs): Promise<
  TypedResponse<{
    mentorFullName: string;
    nextSessionDate: string | null;
    student: null | {
      firstName: string;
      lastName: string;
    };
    sessions: {
      studentId: number;
      attendedOn: Date;
      completedOn: Date | null;
      signedOffOn: Date | null;
    }[];
  }>
> {
  const azureUserId = await getCurrentUserADIdAsync(request);
  const user = await getUserByAzureADIdAsync(azureUserId);

  const mentorFullName = user.firstName + " " + user.lastName;

  const nextSession = await getNextSessionAsync(user.id);
  if (nextSession === null) {
    return json({
      mentorFullName,
      nextSessionDate: null,
      student: null,
      sessions: [],
    });
  }

  const sessions = await getSessionsAsync(user.id, user.chapterId);

  return json({
    mentorFullName,
    nextSessionDate: dayjs(nextSession.attendedOn).format("MMMM D, YYYY"),
    student: nextSession.student,
    sessions,
  });
}

export default function Index() {
  const { mentorFullName, nextSessionDate, student, sessions } =
    useLoaderData<typeof loader>();

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

      {student && (
        <div className="stats w-96 text-primary-content">
          <div className="stat">
            <div className="stat-title">
              Next session with{" "}
              <span className="font-bold">
                {student.firstName} {student.lastName}
              </span>{" "}
              on
            </div>
            <div className="stat-value">{nextSessionDate}</div>
          </div>
        </div>
      )}

      <SubTitle>Recent sessions</SubTitle>

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
            {sessions.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <i>No sessions</i>
                </td>
              </tr>
            )}
            {sessions.map(
              ({ attendedOn, studentId, completedOn, signedOffOn }, index) => (
                <tr key={index}>
                  <td className="border-r">{index + 1}</td>
                  <td align="left">
                    {dayjs(attendedOn).format("MMMM D, YYYY")}
                  </td>
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
                      to={`/mentor/students/${studentId}/sessions/${attendedOn}`}
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
    </div>
  );
}
