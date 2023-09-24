import { FastArrowLeft, FastArrowRight } from "iconoir-react";

interface Props {
  currentPageNumber: number;
  totalPageCount: number;
}

export default function Pagination({
  currentPageNumber,
  totalPageCount,
}: Props) {
  return (
    <div className="join mt-4">
      <button
        type="submit"
        name="previousBtn"
        value="previousBtn"
        className="btn btn-outline join-item"
        disabled={currentPageNumber === 0}
        title="previous"
      >
        <FastArrowLeft />
      </button>
      {Array(totalPageCount)
        .fill(null)
        .map((_, index) => (
          <button
            key={index}
            type="submit"
            name="pageNumberBtn"
            value={index}
            className={
              currentPageNumber === index
                ? "btn btn-outline join-item btn-active "
                : "btn btn-outline join-item"
            }
          >
            {index + 1}
          </button>
        ))}
      <button
        type="submit"
        name="nextBtn"
        value="nextBtn"
        className="btn btn-outline join-item"
        disabled={
          currentPageNumber === totalPageCount - 1 || totalPageCount === 0
        }
        title="next"
      >
        <FastArrowRight />
      </button>
    </div>
  );
}
