import type { SerializeFrom } from "@remix-run/node";
import type { loader } from "../index";

import { Link } from "@remix-run/react";
import classnames from "classnames";

import { PageEdit, GraduationCap, Xmark } from "iconoir-react";
import { SubTitle } from "~/components";

interface Props {
  loaderData: SerializeFrom<typeof loader>;
}

export function TeacherList({ loaderData: { student, isNewStudent } }: Props) {
  const noTeachersAssigned =
    student === null || student.studentTeacher.length === 0;

  return (
    <>
      <SubTitle>Teachers</SubTitle>

      {!noTeachersAssigned && (
        <div className="overflow-auto bg-white">
          <table className="table">
            <thead>
              <tr>
                <th align="left" className="p-2">
                  Teacher full name
                </th>
                <th align="left" className="p-2">
                  School name
                </th>
                <th align="right" className="w-56 p-2">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {student?.studentTeacher.map(({ id, fullName, schoolName }) => (
                <tr key={id}>
                  <td className="border p-2">{fullName}</td>
                  <td className="border p-2">{schoolName}</td>
                  <td className="border p-2">
                    <div className="join w-full">
                      <Link
                        className="btn btn-success join-item btn-xs w-1/2 gap-2"
                        to={`teachers/${id}`}
                      >
                        <PageEdit className="h-4 w-4" />
                        <span className="hidden lg:block">Edit</span>
                      </Link>

                      <Link
                        className="btn btn-error join-item btn-xs w-1/2 gap-2"
                        to={`teachers/${id}/remove`}
                      >
                        <Xmark className="h-4 w-4" />
                        <span className="hidden lg:block">Remove</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {(student === null || student.studentTeacher.length === 0) && (
                <tr>
                  <td colSpan={3} className="border p-2">
                    <i>No teachers assigned to this student</i>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Link
          to="teachers/new"
          className={classnames("btn btn-primary w-48 gap-4", {
            invisible: isNewStudent,
          })}
        >
          <GraduationCap className="h-6 w-6" />
          Add a teacher
        </Link>
      </div>
    </>
  );
}
