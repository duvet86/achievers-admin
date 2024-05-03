import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";

import { Title } from "~/components";

import { getPoliceCheckRemainders } from "./services.server";

export async function loader() {
  const policeCheckEmailRemaindersSent = await getPoliceCheckRemainders();

  return json({
    policeCheckEmailRemaindersSent,
  });
}

export default function Index() {
  const { policeCheckEmailRemaindersSent } = useLoaderData<typeof loader>();

  return (
    <>
      <Title>Email Remainders</Title>

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
              <th align="left">Reminder sent at</th>
              <th align="left">Check expiry date</th>
            </tr>
          </thead>
          <tbody>
            {policeCheckEmailRemaindersSent.length === 0 && (
              <tr>
                <td className="border" colSpan={6}>
                  <i>No remainders sent</i>
                </td>
              </tr>
            )}
            {policeCheckEmailRemaindersSent.map(
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
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
