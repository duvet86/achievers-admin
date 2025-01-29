import type { Option } from "~/components";

import { Form } from "react-router";
import classNames from "classnames";
import { BookmarkBook, InfoCircleSolid, Xmark } from "iconoir-react";

import { Select } from "~/components";

interface Props {
  attendedOn: string;
  studentsForSession: Option[] | null;
  isLoading: boolean;
  onSessionStudentClick: () => void;
}

export function ManageSession({
  attendedOn,
  studentsForSession,
  isLoading,
  onSessionStudentClick,
}: Props) {
  return (
    <details
      className="collapse-arrow bg-base-200 collapse"
      open={studentsForSession !== null}
    >
      <summary
        className="collapse-title bg-base-300 text-center font-medium"
        onClick={onSessionStudentClick}
      >
        Manage
      </summary>
      {studentsForSession && !isLoading ? (
        <div className="collapse-content flex flex-col items-center">
          {studentsForSession.length > 1 && (
            <>
              <Form
                method="POST"
                className="mt-4 flex w-full flex-col items-center justify-between gap-4 sm:flex-row"
              >
                <Select
                  name="studentId"
                  required
                  options={studentsForSession}
                />
                <input type="hidden" name="action" value="book" />
                <input type="hidden" name="status" value="AVAILABLE" />
                <input type="hidden" name="attendedOn" value={attendedOn} />
                <button
                  type="submit"
                  className="btn btn-success w-full sm:w-36"
                >
                  <BookmarkBook />
                  Book
                </button>
              </Form>

              <div className="divider">OR</div>
            </>
          )}

          <Form
            method="POST"
            className={classNames(
              "flex w-full items-center justify-center gap-4",
              {
                "mt-4": studentsForSession.length === 1,
              },
            )}
          >
            <input type="hidden" name="action" value="book" />
            <input type="hidden" name="status" value="AVAILABLE" />
            <input type="hidden" name="attendedOn" value={attendedOn} />
            <button className="btn btn-info btn-block">
              <BookmarkBook />
              Available
              <div
                className="sm:tooltip hidden"
                data-tip=" You don't have a student but are available to
            mentor"
              >
                <InfoCircleSolid />
              </div>
            </button>
          </Form>

          <div className="divider">OR</div>

          <Form
            method="POST"
            className="flex w-full flex-wrap items-center justify-center gap-4"
          >
            <input type="hidden" name="action" value="book" />
            <input type="hidden" name="status" value="UNAVAILABLE" />
            <input type="hidden" name="attendedOn" value={attendedOn} />
            <button className="btn btn-error btn-block">
              <Xmark />
              Unavailable
              <div
                className="sm:tooltip hidden"
                data-tip="  You are NOT available to mentor and won't be
            contacted"
              >
                <InfoCircleSolid />
              </div>
            </button>
          </Form>
        </div>
      ) : (
        <div className="collapse-content mt-4 flex w-full flex-col gap-4">
          <div className="skeleton h-8 w-full"></div>
          <div className="skeleton h-8 w-full"></div>
          <div className="skeleton h-8 w-full"></div>
          <div className="skeleton h-8 w-full"></div>
        </div>
      )}
    </details>
  );
}
