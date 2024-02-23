import type { LoaderFunctionArgs } from "@remix-run/node";

import { Link, json, useLoaderData } from "@remix-run/react";

import { StatsReport, GraduationCap } from "iconoir-react";

import {
  getCurrentUserADIdAsync,
  getUserByAzureADIdAsync,
} from "~/services/.server";
import { Title } from "~/components";

import { getMentorStudentsAsync } from "./services.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const azureUserId = await getCurrentUserADIdAsync(request);
  const user = await getUserByAzureADIdAsync(azureUserId);

  const students = await getMentorStudentsAsync(user.id);

  return json({
    students,
  });
}

export default function Index() {
  const { students } = useLoaderData<typeof loader>();

  return (
    <>
      <Title>My students</Title>

      <div className="overflow-auto bg-white">
        <table className="table table-lg">
          <thead>
            <tr>
              <th align="left" colSpan={2}>
                Full name
              </th>
              <th align="left">Year Level</th>
              <th align="right">Action</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <i>No students assigned</i>
                </td>
              </tr>
            )}
            {students.map(({ id, firstName, lastName, yearLevel }) => (
              <tr key={id}>
                <td align="center">
                  <GraduationCap className="hidden h-4 w-4 lg:block" />
                </td>
                <td>
                  {firstName} {lastName}
                </td>
                <td>{yearLevel ?? "-"}</td>
                <td align="right">
                  <Link
                    to={`/mentor/students/${id}/sessions`}
                    className="btn btn-success btn-xs h-8 gap-2"
                  >
                    <StatsReport className="hidden h-4 w-4 lg:block" />
                    View sessions
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
