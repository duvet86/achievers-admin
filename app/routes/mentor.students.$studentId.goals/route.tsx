import type { LoaderFunctionArgs } from "react-router";

import { Link, useLoaderData } from "react-router";
import { Archery, Check, EditPencil, Eye, Xmark } from "iconoir-react";
import invariant from "tiny-invariant";
import dayjs from "dayjs";

import { getLoggedUserInfoAsync } from "~/services/.server";
import { Title } from "~/components";

import {
  getGoalsForStudent,
  getStudentByIdAsync,
  getUserByAzureADIdAsync,
} from "./services.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.studentId, "studentId not found");

  const loggedUser = await getLoggedUserInfoAsync(request);

  const [user, student] = await Promise.all([
    getUserByAzureADIdAsync(loggedUser.oid),
    getStudentByIdAsync(Number(params.studentId)),
  ]);

  const goals = await getGoalsForStudent(user.id, student.id);

  return {
    student,
    goals,
  };
}

export default function Index() {
  const { student, goals } = useLoaderData<typeof loader>();

  return (
    <>
      <div className="flex items-center justify-between">
        <Title to="/mentor/students">
          Goals for &quot;{student.fullName}&quot;
        </Title>

        <Link
          to={`/mentor/students/${student.id}/goals/new`}
          className="btn btn-primary w-44"
        >
          <Archery /> Create new goal
        </Link>
      </div>

      <div className="overflow-auto bg-white">
        <table className="table-lg table">
          <thead>
            <tr>
              <th className="w-16">#</th>
              <th align="left">Title</th>
              <th align="left">End date</th>
              <th align="left">Completed</th>
              <th align="right">Action</th>
            </tr>
          </thead>
          <tbody>
            {goals.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <Link
                    to={`/mentor/students/${student.id}/goals/new`}
                    className="btn btn-primary w-44"
                  >
                    <Archery /> Create new goal
                  </Link>
                </td>
              </tr>
            )}
            {goals.map(({ id, title, endDate, isAchieved }, index) => (
              <tr key={id}>
                <td>{index + 1}</td>
                <td>{title}</td>
                <td>{endDate ? dayjs(endDate).format("YYYY-MM-DD") : "-"}</td>
                <td>
                  {isAchieved ? (
                    <Check className="text-success" />
                  ) : (
                    <Xmark className="text-error" />
                  )}
                </td>
                <td align="right">
                  {isAchieved ? (
                    <Link
                      to={`/mentor/students/${student.id}/goals/${id}`}
                      className="btn btn-neutral w-36 gap-2"
                    >
                      <Eye className="hidden h-4 w-4 lg:block" />
                      View
                    </Link>
                  ) : (
                    <Link
                      to={`/mentor/students/${student.id}/goals/${id}`}
                      className="btn btn-success w-36 gap-2"
                    >
                      <EditPencil className="hidden h-4 w-4 lg:block" />
                      Edit
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
