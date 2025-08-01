import type { Route } from "./+types/route";

import { Form, useLoaderData } from "react-router";
import dayjs from "dayjs";
import { PageEdit } from "iconoir-react";

import { getPaginationRange, URLSafeSearch } from "~/services";
import { Pagination, StateLink, Title } from "~/components";

import {
  getImportHistoryAsync,
  getImportHistoryCountAsync,
} from "./services.server";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URLSafeSearch(request.url);

  const previousPageSubmit = url.safeSearchParams.getNullOrEmpty("previousBtn");
  const pageNumberSubmit = url.safeSearchParams.getNullOrEmpty("pageNumberBtn");
  const nextPageSubmit = url.safeSearchParams.getNullOrEmpty("nextBtn");

  const pageNumber = Number(url.safeSearchParams.getNullOrEmpty("pageNumber"));

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
}

export default function Index() {
  const { history, count, currentPageNumber, range } =
    useLoaderData<typeof loader>();

  const totalPageCount = Math.ceil(count / 10);

  return (
    <>
      <Title>History of imported students</Title>

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
                ({ student: { id, fullName }, error, createdAt }, index) => (
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
                        to={`/admin/students/${id.toString()}`}
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
