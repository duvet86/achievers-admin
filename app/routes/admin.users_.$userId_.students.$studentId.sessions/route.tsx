import type { LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import invariant from "tiny-invariant";
import { Check, StatsReport, Xmark } from "iconoir-react";
import dayjs from "dayjs";

import { Title } from "~/components";

import {
  getSessionsAsync,
  getStudentAsync,
  getUserAsync,
} from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.userId, "userId not found");
  invariant(params.studentId, "studentId not found");

  const [user, student, sessions] = await Promise.all([
    getUserAsync(Number(params.userId)),
    getStudentAsync(Number(params.studentId)),
    getSessionsAsync(Number(params.userId), Number(params.studentId)),
  ]);

  return json({ user, student, sessions });
}

export default function Index() {
  const { user, student, sessions } = useLoaderData<typeof loader>();

  return (
    <>
      <Title>
        Sessions for mentor &quot;{user.firstName} {user.lastName}&quot;
        mentoring student &quot;{student.firstName} {student.lastName}&quot;
      </Title>

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
            {sessions.map(({ attendedOn, completedOn, signedOffOn }, index) => (
              <tr key={index}>
                <td className="border-r">{index + 1}</td>
                <td align="left">{dayjs(attendedOn).format("MMMM D, YYYY")}</td>
                <td align="left">
                  {signedOffOn ? (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      {dayjs(signedOffOn).format("MMMM D, YYYY")}
                    </div>
                  ) : (
                    <Xmark className="h-6 w-6 text-error" />
                  )}
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
                <td align="right">
                  <Link
                    to={`/admin/users/${user.id}/students/${student.id}/sessions/${attendedOn}`}
                    className="btn btn-success btn-xs h-8 gap-2"
                  >
                    <StatsReport className="hidden h-4 w-4 lg:block" />
                    View report
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
