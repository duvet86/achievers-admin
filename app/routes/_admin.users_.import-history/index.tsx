import type { ActionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";

import { FastArrowLeft, FastArrowRight, PageEdit } from "iconoir-react";

import { Title, BackHeader } from "~/components";

import {
  getImportHistoryAsync,
  getImportHistoryCountAsync,
} from "./services.server";

export const loader = async () => {
  const [count, history] = await Promise.all([
    getImportHistoryCountAsync(),
    getImportHistoryAsync(0),
  ]);

  return json({ count, history });
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();

  const previousPageSubmit = formData.get("previousBtn")?.toString();
  const pageNumberSubmit = formData.get("pageNumberBtn")?.toString();
  const nextPageSubmit = formData.get("nextBtn")?.toString();

  const pageNumber = Number(formData.get("pageNumber")!.toString());

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
    currentPageNumber,
    history,
  });
};

export default function Index() {
  const { history, count } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const totalPageCount = Math.ceil(count / 10);
  const currentPageNumber = actionData?.currentPageNumber ?? 0;

  const pageHistory = actionData?.history ?? history;

  return (
    <>
      <BackHeader />

      <Title>History of imported mentors</Title>

      <Form method="post">
        <div className="overflow-auto">
          <table className="table">
            <thead>
              <tr>
                <th align="left" className="w-12 p-2">
                  #
                </th>
                <th align="left" className="p-2">
                  Full name
                </th>
                <th align="left" className="p-2 w-2/5">
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
              {pageHistory.length === 0 && (
                <tr>
                  <td colSpan={3} className="border p-2">
                    <i>No mentors imported</i>
                  </td>
                </tr>
              )}
              {pageHistory.map(
                (
                  { user: { id, firstName, lastName }, error, createdAt },
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
                        to={`/users/${id.toString()}`}
                        className="btn-success btn-xs btn w-full gap-2"
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
      </Form>
    </>
  );
}
