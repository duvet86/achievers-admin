import type { Route } from "./+types/route";

import { Archery, StatsReport, WarningTriangle } from "iconoir-react";

import { getLoggedUserInfoAsync } from "~/services/.server";
import { StateLink, Title } from "~/components";

import { getMentorStudentsAsync } from "./services.server";

export async function loader({ request }: Route.LoaderArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);
  const students = await getMentorStudentsAsync(loggedUser.oid);

  return {
    students,
  };
}

export default function Index({
  loaderData: { students },
}: Route.ComponentProps) {
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
                <td>
                  <div className="flex justify-end gap-4">
                    <StateLink
                      className="btn btn-error w-48 gap-2"
                      to={`/mentor/students/${id}/report-to-admin`}
                    >
                      <WarningTriangle className="hidden h-4 w-4 lg:block" />
                      Report to Admin
                    </StateLink>

                    <StateLink
                      to={`/mentor/view-reports?studentId=${id}`}
                      state={{ from: "/mentor/students" }}
                      className="btn btn-success w-48 gap-2"
                    >
                      <StatsReport className="hidden h-4 w-4 lg:block" />
                      Mentor reports
                    </StateLink>

                    <StateLink
                      to={`/mentor/students/${id}/school-reports`}
                      className="btn w-48 gap-2"
                    >
                      <StatsReport className="hidden h-4 w-4 lg:block" />
                      School reports
                    </StateLink>

                    <StateLink
                      to={`/mentor/students/${id}/goals`}
                      className="btn btn-primary w-48 gap-2"
                    >
                      <Archery className="hidden h-4 w-4 lg:block" />
                      Goals
                    </StateLink>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
