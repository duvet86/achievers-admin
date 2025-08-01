import type { Route } from "./+types/route";

import { Form } from "react-router";
import dayjs from "dayjs";
import classNames from "classnames";
import { Eye } from "iconoir-react";

import { getPaginationRange, URLSafeSearch } from "~/services";
import { Pagination, StateLink, Title } from "~/components";

import { getWWCCheckReminders, getWWCRemindersCount } from "./services.server";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URLSafeSearch(request.url);

  const previousPageSubmit = url.safeSearchParams.getNullOrEmpty("previousBtn");
  const pageNumberSubmit = url.safeSearchParams.getNullOrEmpty("pageNumberBtn");
  const nextPageSubmit = url.safeSearchParams.getNullOrEmpty("nextBtn");

  const pageNumber = Number(url.safeSearchParams.getNullOrEmpty("pageNumber")!);

  const policeCheckEmailRemindersSentCount = await getWWCRemindersCount();

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

  const wwcEmailRemindersSent = await getWWCCheckReminders(currentPageNumber);

  return {
    range,
    currentPageNumber,
    totalPageCount,
    wwcEmailRemindersSent,
  };
}

export default function Index({
  loaderData: {
    wwcEmailRemindersSent,
    range,
    currentPageNumber,
    totalPageCount,
  },
}: Route.ComponentProps) {
  return (
    <Form>
      <Title>WWC email reminders</Title>

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
            {wwcEmailRemindersSent.length === 0 && (
              <tr>
                <td className="border" colSpan={6}>
                  <i>No reminders sent</i>
                </td>
              </tr>
            )}
            {wwcEmailRemindersSent.map(
              (
                {
                  id,
                  mentor,
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
                  <td>
                    <div className="flex gap-2">
                      {index + 1 + 10 * currentPageNumber}
                    </div>
                  </td>
                  <td>{mentor.fullName}</td>
                  <td>
                    <div className="flex items-center gap-4">
                      {dayjs(expiryDate).format("MMMM D, YYYY")}
                      {hasExpired && <span className="badge">Expired</span>}
                      {isExpiring && (
                        <span className="badge">Expiring soon</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {reminderSentAt
                      ? dayjs(reminderSentAt).format("MMMM D, YYYY")
                      : "-"}
                  </td>
                  <td>
                    <StateLink
                      to={`/admin/mentors/${mentor.id}/wwc-check`}
                      className="btn btn-success btn-xs w-full gap-2"
                    >
                      <Eye className="hidden h-4 w-4 lg:block" />
                      View
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
  );
}
