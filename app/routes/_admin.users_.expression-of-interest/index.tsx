import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import UserPlusIcon from "@heroicons/react/24/solid/UserPlusIcon";

import BackHeader from "~/components/BackHeader";
import Title from "~/components/Title";

import { getEOIUsersAsync } from "./services.server";

export async function loader() {
  const eoiUsers = await getEOIUsersAsync();

  return json({
    eoiUsers,
  });
}

export default function Index() {
  const { eoiUsers } = useLoaderData<typeof loader>();

  return (
    <>
      <BackHeader />

      <Title>Expression of interest</Title>

      <div className="overflow-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th align="left" className="w-2/5 p-2">
                Email
              </th>
              <th align="left" className="w-2/5 p-2">
                Full name
              </th>
              <th align="right" className="p-2">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {eoiUsers.length === 0 && (
              <tr>
                <td colSpan={3} className="border p-2">
                  <i>No expressions of interest</i>
                </td>
              </tr>
            )}
            {eoiUsers.map(({ id, email, firstName, lastName }) => (
              <tr key={id}>
                <td className="border p-2">{email}</td>
                <td className="border p-2">
                  {firstName} {lastName}
                </td>
                <td align="right" className="border p-2">
                  <Link
                    to={`${id}`}
                    className="btn-success btn-xs btn w-full gap-2 align-middle"
                  >
                    <UserPlusIcon className="h-4 w-4" />
                    View/Invite
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
