import classNames from "classnames";

import { FastArrowLeft, FastArrowRight, MoreHoriz } from "iconoir-react";

interface Props {
  range: number[];
  currentPageNumber: number;
  totalPageCount: number;
}

export function Pagination({
  range,
  currentPageNumber,
  totalPageCount,
}: Props) {
  const isPreviousDisabled = currentPageNumber === 0;
  const isNextDisabled =
    currentPageNumber === totalPageCount - 1 || totalPageCount === 0;

  return (
    <div className="join mt-4">
      <button
        type="submit"
        name="previousBtn"
        value="previousBtn"
        className={classNames("btn btn-outline join-item btn-sm sm:btn-md", {
          "btn-disabled": isPreviousDisabled,
        })}
        disabled={isPreviousDisabled}
        title="previous"
      >
        <FastArrowLeft />
      </button>
      {range.map((pageNumber, index) =>
        pageNumber === -1 ? (
          <button
            key={index}
            className="btn btn-disabled btn-outline join-item btn-sm sm:btn-md"
          >
            <MoreHoriz />
          </button>
        ) : (
          <button
            key={index}
            type="submit"
            name="pageNumberBtn"
            value={pageNumber - 1}
            className={classNames("btn join-item btn-sm sm:btn-md", {
              "btn-outline": currentPageNumber !== pageNumber - 1,
              "btn-primary": currentPageNumber === pageNumber - 1,
            })}
          >
            {pageNumber}
          </button>
        ),
      )}
      <button
        type="submit"
        name="nextBtn"
        value="nextBtn"
        className={classNames("btn btn-outline join-item btn-sm sm:btn-md", {
          "btn-disabled": isNextDisabled,
        })}
        disabled={isNextDisabled}
        title="next"
      >
        <FastArrowRight />
      </button>
    </div>
  );
}
