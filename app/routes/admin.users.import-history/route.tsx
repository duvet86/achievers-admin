import type { Route } from "./+types/route";

import { Form } from "react-router";
import dayjs from "dayjs";
import { PageEdit } from "iconoir-react";

import { getPaginationRange } from "~/services";
import { Pagination, StateLink, Title } from "~/components";

import {
  getImportHistoryAsync,
  getImportHistoryCountAsync,
} from "./services.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);

  const previousPageSubmit = url.searchParams.get("previousBtn");
  const pageNumberSubmit = url.searchParams.get("pageNumberBtn");
  const nextPageSubmit = url.searchParams.get("nextBtn");

  const pageNumber = Number(url.searchParams.get("pageNumber"));

  const count = await getImportHistoryCountAsync();
  const totalPageCount = Math.ceil(count / 10);

  let currentPageNumber = 0;
  if (previousPageSubmit !== null && pageNumber > 0) {
    currentPageNumber = pageNumber - 1;
  } else if (nextPageSubmit !== null && pageNumber < totalPageCount) {
    currentPageNumber = pageNumber + 1;
  } else if (pageNumberSubmit !== null) {
    currentPageNumber = Number(pageNumberSubmit);
  }

  const history = await getImportHistoryAsync(currentPageNumber);

  const range = getPaginationRange(totalPageCount, currentPageNumber + 1);

  return {
    count,
    currentPageNumber,
    history,
    range,
  };
};

export default function Index({
  loaderData: { history, count, currentPageNumber, range },
}: Route.ComponentProps) {
  const totalPageCount = Math.ceil(count / 10);

  return (
    <>
      <Title>History of imported mentors</Title>

      <Form>
        <div className="overflow-auto bg-white">
          <table className="table">
            <thead>
              <tr>
                <th align="left" className="w-12">
                  #
                </th>
                <th align="left">Full name</th>
                <th align="left" className="w-2/5">
                  Errors
                </th>
                <th align="left">Imported at</th>
                <th align="right">Action</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 && (
                <tr>
                  <td colSpan={3}>
                    <i>No mentors imported</i>
                  </td>
                </tr>
              )}
              {history.map(
                ({ user: { id, fullName }, error, createdAt }, index) => (
                  <tr
                    key={id}
                    className={error !== null ? "bg-error" : undefined}
                  >
                    <td>{index + 1 + currentPageNumber * 10}</td>
                    <td>{fullName}</td>
                    <td>{error}</td>
                    <td>{dayjs(createdAt).format("YYYY/MM/DD hh:mm")}</td>
                    <td>
                      <StateLink
                        to={`/admin/users/${id.toString()}`}
                        className="btn btn-success btn-xs w-full gap-2"
                      >
                        <PageEdit className="h-4 w-4" />
                        Edit
                      </StateLink>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>

        <input type="hidden" name="pageNumber" value={currentPageNumber} />

        <Pagination
          range={range}
          currentPageNumber={currentPageNumber}
          totalPageCount={totalPageCount}
        />
      </Form>
    </>
  );
}
