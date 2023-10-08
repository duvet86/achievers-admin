import type { LoaderArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";

import { FastArrowLeft, FastArrowRight, PageEdit } from "iconoir-react";

import { Title, BackHeader } from "~/components";

import {
  getImportHistoryAsync,
  getImportHistoryCountAsync,
} from "./services.server";

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);

  const previousPageSubmit = url.searchParams.get("previousBtn")?.toString();
  const pageNumberSubmit = url.searchParams.get("pageNumberBtn")?.toString();
  const nextPageSubmit = url.searchParams.get("nextBtn")?.toString();

  const pageNumber = Number(url.searchParams.get("pageNumber")!.toString());

  const count = await getImportHistoryCountAsync();
  const totalPageCount = Math.ceil(count / 10);

  let currentPageNumber = 0;
  if (previousPageSubmit !== undefined && pageNumber > 0) {
    currentPageNumber = pageNumber - 1;
  } else if (nextPageSubmit !== undefined && pageNumber < totalPageCount) {
    currentPageNumber = pageNumber + 1;
  } else if (pageNumberSubmit !== undefined) {
    currentPageNumber = Number(pageNumberSubmit);
  }

  const history = await getImportHistoryAsync(currentPageNumber);

  return json({
    count,
    currentPageNumber,
    history,
  });
};

export default function Index() {
  const { history, count, currentPageNumber } = useLoaderData<typeof loader>();

  const totalPageCount = Math.ceil(count / 10);

  return (
    <>
      <BackHeader />

      <Title>History of imported students</Title>

      <Form method="post">
        <div className="overflow-auto bg-white">
          <table className="table">
            <thead>
              <tr>
                <th align="left" className="w-12 p-2">
                  #
                </th>
                <th align="left" className="p-2">
                  Full name
                </th>
                <th align="left" className="w-2/5 p-2">
                  Errors
                </th>
                <th align="left" className="p-2">
                  Imported at
                </th>
                <th align="right" className="p-2">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 && (
                <tr>
                  <td colSpan={3} className="border p-2">
                    <i>No mentors imported</i>
                  </td>
                </tr>
              )}
              {history.map(
                (
                  { student: { id, firstName, lastName }, error, createdAt },
                  index,
                ) => (
                  <tr
                    key={id}
                    className={error !== null ? "bg-error" : undefined}
                  >
                    <td className="border p-2">{index + 1}</td>
                    <td className="border p-2">
                      {firstName} {lastName}
                    </td>
                    <td className="border p-2">{error}</td>
                    <td className="border p-2">
                      {dayjs(createdAt).format("YYYY/MM/DD hh:mm")}
                    </td>
                    <td className="border p-2">
                      <Link
                        to={`/admin/students/${id.toString()}`}
                        className="btn btn-success btn-xs w-full gap-2"
                      >
                        <PageEdit className="h-4 w-4" />
                        Edit
                      </Link>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>

        <input type="hidden" name="pageNumber" value={currentPageNumber} />

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
      </Form>
    </>
  );
}
