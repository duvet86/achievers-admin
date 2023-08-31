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
        className="join-item btn-outline btn"
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
                ? "join-item btn-outline btn-active btn "
                : "join-item btn-outline btn"
            }
          >
            {index + 1}
          </button>
        ))}
      <button
        type="submit"
        name="nextBtn"
        value="nextBtn"
        className="join-item btn-outline btn"
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
