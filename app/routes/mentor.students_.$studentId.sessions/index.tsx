import type { LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import invariant from "tiny-invariant";
import dayjs from "dayjs";
import { StatsReport } from "iconoir-react";

import {
  getCurrentUserADIdAsync,
  getUserByAzureADIdAsync,
} from "~/services/.server";
import { Title } from "~/components";

import { getSessionsForStudentAsync, getStudentAsync } from "./services.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.studentId, "studentId not found");

  const azureUserId = await getCurrentUserADIdAsync(request);
  const user = await getUserByAzureADIdAsync(azureUserId);

  const student = await getStudentAsync(Number(params.studentId));
  const sessions = await getSessionsForStudentAsync(
    user.id,
    user.chapterId,
    student.id,
  );

  return json({
    student,
    sessions,
  });
}

export default function Index() {
  const { student, sessions } = useLoaderData<typeof loader>();

  return (
    <>
      <Title>
        Sessions for &quot;{student.firstName} {student.lastName}&quot;
      </Title>

      <div className="overflow-auto bg-white">
        <table className="table table-lg">
          <thead>
            <tr>
              <th className="w-6">#</th>
              <th align="left">Session date</th>
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
            {sessions.map(({ attendedOn }, index) => (
              <tr key={index}>
                <td className="border-r">{index + 1}</td>
                <td align="left">{dayjs(attendedOn).format("MMMM D, YYYY")}</td>
                <td align="right">
                  <Link
                    to={`/mentor/students/${student.id}/sessions/${attendedOn}`}
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
