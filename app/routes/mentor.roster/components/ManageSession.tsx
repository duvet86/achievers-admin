import { Form } from "@remix-run/react";

import { BookmarkBook, InfoCircle } from "iconoir-react";
import { useState } from "react";

import { Select, type Option } from "~/components";

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
  const [isOpen, setIsOpen] = useState(false);

  const onSummaryOpen = () => {
    setIsOpen(!isOpen);

    if (!isOpen) {
      onSessionStudentClick();
    }
  };

  return (
    <details className="collapse collapse-arrow bg-base-200">
      <summary
        className="collapse-title bg-base-300 text-center font-medium"
        onClick={onSummaryOpen}
      >
        Manage
      </summary>
      {studentsForSession && !isLoading ? (
        <div className="collapse-content flex flex-col items-center">
          <Form
            method="POST"
            className="mt-4 flex w-full flex-col items-center justify-between gap-4 sm:flex-row"
          >
            <Select name="studentId" required options={studentsForSession} />
            <input type="hidden" name="action" value="book" />
            <input type="hidden" name="status" value="AVAILABLE" />
            <input type="hidden" name="attendedOn" value={attendedOn} />
            <button
              type="submit"
              className="btn btn-success btn-sm w-full sm:w-36"
            >
              <BookmarkBook />
              Book
            </button>
          </Form>

          <div className="divider">OR</div>

          <Form
            method="POST"
            className="flex w-full items-center justify-center gap-4"
          >
            <input type="hidden" name="action" value="book" />
            <input type="hidden" name="status" value="AVAILABLE" />
            <input type="hidden" name="attendedOn" value={attendedOn} />
            <button className="btn btn-info btn-sm w-full sm:w-36">
              <BookmarkBook />
              Available
            </button>
            <div
              className="hidden sm:tooltip sm:block"
              data-tip=" You don't have a student but are available to
            mentor"
            >
              <InfoCircle />
            </div>
          </Form>

          <div className="divider">OR</div>

          <Form
            method="POST"
            className="flex w-full flex-wrap items-center justify-center gap-4"
          >
            <input type="hidden" name="action" value="book" />
            <input type="hidden" name="status" value="UNAVAILABLE" />
            <input type="hidden" name="attendedOn" value={attendedOn} />
            <button className="btn btn-error btn-sm w-full sm:w-36">
              <BookmarkBook />
              Unavailable
            </button>
            <div
              className="hidden sm:tooltip sm:block"
              data-tip="  You are NOT available to mentor and won't be
            contacted"
            >
              <InfoCircle />
            </div>
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
