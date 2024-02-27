import type { SerializeFrom } from "@remix-run/node";
import type { loader } from "../route";

import { Link } from "@remix-run/react";
import classnames from "classnames";

import { Xmark, HomeShield, PageEdit } from "iconoir-react";
import { SubTitle } from "~/components";

interface Props {
  loaderData: SerializeFrom<typeof loader>;
}

export function GuardianList({ loaderData: { student, isNewStudent } }: Props) {
  const noGuardiansAssigned = student === null || student.guardian.length === 0;

  return (
    <>
      <SubTitle>Guardians/Parents</SubTitle>

      {!noGuardiansAssigned && (
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
              {student?.guardian.map(({ id, fullName, relationship }) => (
                <tr key={id}>
                  <td className="border">{fullName}</td>
                  <td className="border">{relationship}</td>
                  <td className="border">
                    <div className="join w-full">
                      <Link
                        className="btn btn-success join-item btn-xs w-1/2 gap-2"
                        to={`guardians/${id}`}
                      >
                        <PageEdit className="h-4 w-4" />
                        <span className="hidden lg:block">Edit</span>
                      </Link>

                      <Link
                        className="btn btn-error join-item btn-xs w-1/2 gap-2"
                        to={`guardians/${id}/remove`}
                      >
                        <Xmark className="h-4 w-4" />
                        <span className="hidden lg:block">Remove</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Link
          to="guardians/new"
          className={classnames("btn btn-primary w-48 gap-4", {
            invisible: isNewStudent,
          })}
        >
          <HomeShield className="h-6 w-6" />
          Add a guardian
        </Link>
      </div>
    </>
  );
}
