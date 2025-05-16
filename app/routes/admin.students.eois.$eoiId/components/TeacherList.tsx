import { Eye } from "iconoir-react";

import { StateLink, SubTitle } from "~/components";

interface Props {
  studentTeacher: {
    id: number;
    fullName: string;
    schoolName: string;
  }[];
}

export function TeacherList({ studentTeacher }: Props) {
  const noTeachersAssigned = studentTeacher.length === 0;

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
                  <td align="right">
                    <StateLink
                      className="btn btn-primary btn-xs gap-2"
                      to={`teachers/${id}`}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="hidden lg:block">View</span>
                    </StateLink>
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
    </>
  );
}
