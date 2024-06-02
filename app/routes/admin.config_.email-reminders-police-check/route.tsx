import type { LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import classNames from "classnames";
import { Eye } from "iconoir-react";

import { getPaginationRange } from "~/services";
import { Pagination, Title } from "~/components";

import {
  getPoliceCheckReminders,
  getPoliceCheckRemindersCount,
} from "./services.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const previousPageSubmit = url.searchParams.get("previousBtn");
  const pageNumberSubmit = url.searchParams.get("pageNumberBtn");
  const nextPageSubmit = url.searchParams.get("nextBtn");

  const pageNumber = Number(url.searchParams.get("pageNumber")!);

  const policeCheckEmailRemindersSentCount =
    await getPoliceCheckRemindersCount();

  const totalPageCount = Math.ceil(policeCheckEmailRemindersSentCount / 10);

  let currentPageNumber = 0;
  if (previousPageSubmit !== null && pageNumber > 0) {
    currentPageNumber = pageNumber - 1;
  } else if (nextPageSubmit !== null && pageNumber < totalPageCount) {
    currentPageNumber = pageNumber + 1;
  } else if (pageNumberSubmit !== null) {
    currentPageNumber = Number(pageNumberSubmit);
  }

  const range = getPaginationRange(totalPageCount, currentPageNumber + 1);

  const policeCheckEmailRemindersSent =
    await getPoliceCheckReminders(currentPageNumber);

  return json({
    range,
    currentPageNumber,
    totalPageCount,
    policeCheckEmailRemindersSent,
  });
}

export default function Index() {
  const {
    policeCheckEmailRemindersSent,
    range,
    currentPageNumber,
    totalPageCount,
  } = useLoaderData<typeof loader>();

  return (
    <Form>
      <Title to="/admin/config">Police check email reminders</Title>

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
            {policeCheckEmailRemindersSent.length === 0 && (
              <tr>
                <td className="border" colSpan={6}>
                  <i>No reminders sent</i>
                </td>
              </tr>
            )}
            {policeCheckEmailRemindersSent.map(
              (
                {
                  id,
                  user,
                  expiryDate,
                  reminderSentAt,
                  isExpiring,
                  hasExpired,
                },
                index,
              ) => (
                <tr
                  key={id}
                  className={classNames({
                    "bg-warning": isExpiring,
                    "bg-error text-white": hasExpired,
                  })}
                >
                  <td className="border">
                    <div className="flex gap-2">{index + 1}</div>
                  </td>
                  <td className="border">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="border">
                    <div className="flex items-center gap-4">
                      {dayjs(expiryDate).format("MMMM D, YYYY")}
                      {hasExpired && <span className="badge">Expired</span>}
                      {isExpiring && (
                        <span className="badge">Expiring soon</span>
                      )}
                    </div>
                  </td>
                  <td className="border">
                    {reminderSentAt
                      ? dayjs(reminderSentAt).format("MMMM D, YYYY")
                      : "-"}
                  </td>
                  <td className="border">
                    <Link
                      to={`/admin/users/${user.id}/police-check`}
                      className="btn btn-success btn-xs w-full gap-2"
                    >
                      <Eye className="hidden h-4 w-4 lg:block" />
                      View
                    </Link>
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
  );
}
