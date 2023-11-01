import type { SerializeFrom } from "@remix-run/node";
import type { loader } from "../index";

import { Link } from "@remix-run/react";

import { Xmark, HomeShield, PageEdit } from "iconoir-react";
import { SubTitle } from "~/components";

interface Props {
  loaderData: SerializeFrom<typeof loader>;
}

export function GuardianList({ loaderData: { student } }: Props) {
  return (
    <>
      <SubTitle>Guardians/Parents</SubTitle>

      <div className="overflow-auto bg-white">
        <table className="table">
          <thead>
            <tr>
              <th align="left" className="p-2">
                Guardian full name
              </th>
              <th align="left" className="p-2">
                Guardian relationship
              </th>
              <th align="right" className="w-56 p-2">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {student.guardian.map(({ id, fullName, relationship }) => (
              <tr key={id}>
                <td className="border p-2">{fullName}</td>
                <td className="border p-2">{relationship}</td>
                <td className="border p-2">
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
            {student.guardian.length === 0 && (
              <tr>
                <td colSpan={3} className="border p-2">
                  <i>No guardians assigned to this student</i>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <Link to="guardians/new" className="btn btn-primary w-64 gap-4">
          <HomeShield className="h-6 w-6" />
          Add a guardian
        </Link>
      </div>
    </>
  );
}
