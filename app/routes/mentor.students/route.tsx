import type { LoaderFunctionArgs } from "react-router";

import { Link, useLoaderData } from "react-router";
import { StatsReport } from "iconoir-react";

import { getLoggedUserInfoAsync } from "~/services/.server";
import { Title } from "~/components";

import { getMentorStudentsAsync } from "./services.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);
  const students = await getMentorStudentsAsync(loggedUser.oid);

  return {
    students,
  };
}

export default function Index() {
  const { students } = useLoaderData<typeof loader>();

  return (
    <>
      <Title>My students</Title>

      <div className="overflow-auto bg-white">
        <table className="table-lg table">
          <thead>
            <tr>
              <th className="w-16">#</th>
              <th align="left">Full name</th>
              <th align="left">Year Level</th>
              <th align="right">Action</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <i>No students assigned</i>
                </td>
              </tr>
            )}
            {students.map(({ id, fullName, yearLevel }, index) => (
              <tr key={id}>
                <td>{index + 1}</td>
                <td>{fullName}</td>
                <td>{yearLevel ?? "-"}</td>
                <td align="right">
                  <Link
                    to={`/mentor/student-sessions?selectedStudentId=${id}&back_url=/mentor/students`}
                    className="btn btn-success btn-xs h-12 gap-2"
                  >
                    <StatsReport className="hidden h-4 w-4 lg:block" />
                    View latest report
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
