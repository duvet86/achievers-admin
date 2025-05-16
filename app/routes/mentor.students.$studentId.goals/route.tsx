import type { Route } from "./+types/route";

import { Archery, Check, EditPencil, Eye, Xmark } from "iconoir-react";
import invariant from "tiny-invariant";
import dayjs from "dayjs";

import { getLoggedUserInfoAsync } from "~/services/.server";
import { StateLink, Title } from "~/components";

import {
  getGoalsForStudent,
  getStudentByIdAsync,
  getUserByAzureADIdAsync,
} from "./services.server";

export async function loader({ request, params }: Route.LoaderArgs) {
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

export default function Index({
  loaderData: { student, goals },
}: Route.ComponentProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <Title>Goals for &quot;{student.fullName}&quot;</Title>

        <StateLink
          to={`/mentor/students/${student.id}/goals/new`}
          className="btn btn-primary w-44"
        >
          <Archery /> Create new goal
        </StateLink>
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
                  <StateLink
                    to={`/mentor/students/${student.id}/goals/new`}
                    className="btn btn-primary w-44"
                  >
                    <Archery /> Create new goal
                  </StateLink>
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
                    <StateLink
                      to={`/mentor/students/${student.id}/goals/${id}`}
                      className="btn btn-neutral w-36 gap-2"
                    >
                      <Eye className="hidden h-4 w-4 lg:block" />
                      View
                    </StateLink>
                  ) : (
                    <StateLink
                      to={`/mentor/students/${student.id}/goals/${id}`}
                      className="btn btn-success w-36 gap-2"
                    >
                      <EditPencil className="hidden h-4 w-4 lg:block" />
                      Edit
                    </StateLink>
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
