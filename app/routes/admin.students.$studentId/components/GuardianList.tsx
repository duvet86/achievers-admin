import { Link, useFetcher } from "react-router";
import classnames from "classnames";

import { Xmark, HomeShield, PageEdit } from "iconoir-react";
import { SubTitle } from "~/components";

interface Props {
  isNewStudent: boolean;
  guardian: {
    id: number;
    fullName: string;
    relationship: string;
  }[];
}

export function GuardianList({ guardian, isNewStudent }: Props) {
  const { state, Form, submit } = useFetcher();

  const isLoading = state !== "idle";
  const noGuardiansAssigned = guardian.length === 0;

  const onGuardianRemoved =
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
              {guardian.map(({ id, fullName, relationship }) => (
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

                      <Form
                        onSubmit={onGuardianRemoved(fullName)}
                        className="btn btn-error join-item btn-xs w-1/2"
                      >
                        <input type="hidden" name="guardianId" value={id} />
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
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Link
          to="guardians/new"
          className={classnames("btn btn-primary btn-block gap-4 sm:w-48", {
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
