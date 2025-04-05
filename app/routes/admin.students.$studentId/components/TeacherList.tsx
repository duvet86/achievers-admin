import { useFetcher } from "react-router";
import classnames from "classnames";

import { PageEdit, GraduationCap, Xmark } from "iconoir-react";
import { StateLink, SubTitle } from "~/components";

interface Props {
  isNewStudent: boolean;
  studentTeacher: {
    id: number;
    fullName: string;
    schoolName: string;
  }[];
}

export function TeacherList({ studentTeacher, isNewStudent }: Props) {
  const { state, Form, submit } = useFetcher();

  const isLoading = state !== "idle";
  const noTeachersAssigned = studentTeacher.length === 0;

  const onTeacherRemoved =
    (fullName: string) => (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (confirm(`Are you sure you want to remove "${fullName}"?`)) {
        void submit(e.currentTarget, {
          method: "DELETE",
        });
      }
    };

  return (
    <>
      <SubTitle>Teachers</SubTitle>

      {!noTeachersAssigned && (
        <div className="overflow-auto bg-white">
          <table className="table">
            <thead>
              <tr>
                <th align="left">Teacher full name</th>
                <th align="left">School name</th>
                <th align="right" className="w-56">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {studentTeacher.map(({ id, fullName, schoolName }) => (
                <tr key={id}>
                  <td>{fullName}</td>
                  <td>{schoolName}</td>
                  <td>
                    <div className="join w-full">
                      <StateLink
                        className="btn btn-success join-item btn-xs w-1/2 gap-2"
                        to={`teachers/${id}`}
                      >
                        <PageEdit className="h-4 w-4" />
                        <span className="hidden lg:block">Edit</span>
                      </StateLink>

                      <Form
                        onSubmit={onTeacherRemoved(fullName)}
                        className="btn btn-error join-item btn-xs w-1/2"
                      >
                        <input type="hidden" name="teacherId" value={id} />
                        <button
                          type="submit"
                          className="flex items-center gap-1"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <span className="loading loading-spinner h-4 w-4"></span>{" "}
                              Loading...
                            </>
                          ) : (
                            <>
                              <Xmark className="h-4 w-4" />
                              <span className="hidden lg:block">Remove</span>
                            </>
                          )}
                        </button>
                      </Form>
                    </div>
                  </td>
                </tr>
              ))}
              {studentTeacher.length === 0 && (
                <tr>
                  <td colSpan={3}>
                    <i>No teachers assigned to this student</i>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <StateLink
          to="teachers/new"
          className={classnames("btn btn-primary btn-block gap-4 sm:w-48", {
            invisible: isNewStudent,
          })}
        >
          <GraduationCap className="h-6 w-6" />
          Add a teacher
        </StateLink>
      </div>
    </>
  );
}
