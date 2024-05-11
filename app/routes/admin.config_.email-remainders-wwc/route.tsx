import type { LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import { Eye } from "iconoir-react";

import { getPaginationRange } from "~/services";
import { Pagination, Title } from "~/components";

import {
  getWWCCheckRemainders,
  getWWCRemaindersCount,
} from "./services.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const previousPageSubmit = url.searchParams.get("previousBtn");
  const pageNumberSubmit = url.searchParams.get("pageNumberBtn");
  const nextPageSubmit = url.searchParams.get("nextBtn");

  const pageNumber = Number(url.searchParams.get("pageNumber")!);

  const policeCheckEmailRemaindersSentCount = await getWWCRemaindersCount();

  const totalPageCount = Math.ceil(policeCheckEmailRemaindersSentCount / 10);

  let currentPageNumber = 0;
  if (previousPageSubmit !== null && pageNumber > 0) {
    currentPageNumber = pageNumber - 1;
  } else if (nextPageSubmit !== null && pageNumber < totalPageCount) {
    currentPageNumber = pageNumber + 1;
  } else if (pageNumberSubmit !== null) {
    currentPageNumber = Number(pageNumberSubmit);
  }

  const range = getPaginationRange(totalPageCount, currentPageNumber + 1);

  const wwcEmailRemaindersSent = await getWWCCheckRemainders(currentPageNumber);

  return json({
    range,
    currentPageNumber,
    totalPageCount,
    wwcEmailRemaindersSent,
  });
}

export default function Index() {
  const { wwcEmailRemaindersSent, range, currentPageNumber, totalPageCount } =
    useLoaderData<typeof loader>();

  return (
    <Form>
      <Title>WWC email remainders</Title>

      <div className="overflow-auto bg-white">
        <table className="table">
          <thead>
            <tr>
              <th align="left" className="w-14">
                #
              </th>
              <th align="left" className="w-1/3">
                Full name
              </th>
              <th align="left">Check expiry date</th>
              <th align="left">Reminder sent at</th>
              <th align="right">Action</th>
            </tr>
          </thead>
          <tbody>
            {wwcEmailRemaindersSent.length === 0 && (
              <tr>
                <td className="border" colSpan={6}>
                  <i>No remainders sent</i>
                </td>
              </tr>
            )}
            {wwcEmailRemaindersSent.map(
              ({ id, user, expiryDate, reminderSentAt }, index) => {
                return (
                  <tr key={id}>
                    <td className="border">
                      <div className="flex gap-2">{index + 1}</div>
                    </td>
                    <td className="border">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="border">
                      {dayjs(expiryDate).format("MMMM D, YYYY")}
                    </td>
                    <td className="border">
                      {dayjs(reminderSentAt).format("MMMM D, YYYY")}
                    </td>
                    <td className="border">
                      <Link
                        to={`/admin/users/${user.id}/wwc-check`}
                        className="btn btn-success btn-xs w-full gap-2"
                      >
                        <Eye className="hidden h-4 w-4 lg:block" />
                        View
                      </Link>
                    </td>
                  </tr>
                );
              },
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
  );
}
