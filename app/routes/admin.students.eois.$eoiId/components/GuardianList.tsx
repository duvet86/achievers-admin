import { Eye } from "iconoir-react";

import { StateLink, SubTitle } from "~/components";

interface Props {
  studentGuardian: {
    id: number;
    fullName: string;
    relationship: string;
  }[];
}

export function GuardianList({ studentGuardian }: Props) {
  return (
    <>
      <SubTitle>Guardians/Parents</SubTitle>

      <div className="overflow-auto bg-white">
        <table className="table">
          <thead>
            <tr>
              <th align="left">Guardian full name</th>
              <th align="left">Guardian relationship</th>
              <th align="right" className="w-56">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {studentGuardian.map(({ id, fullName, relationship }) => (
              <tr key={id}>
                <td>{fullName}</td>
                <td>{relationship}</td>
                <td align="right">
                  <StateLink
                    className="btn btn-primary btn-xs gap-2"
                    to={`guardians/${id}`}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="hidden lg:block">View</span>
                  </StateLink>
                </td>
              </tr>
            ))}
            {studentGuardian.length === 0 && (
              <tr>
                <td colSpan={3}>
                  <i>No guardians assigned to this student</i>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
