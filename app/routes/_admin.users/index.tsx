import { useLoaderData, Link } from "@remix-run/react";

import { json } from "@remix-run/node";

import ArrowUpTrayIcon from "@heroicons/react/24/solid/ArrowUpTrayIcon";
import PencilIcon from "@heroicons/react/24/solid/PencilIcon";

import Title from "~/components/Title";

import { getUsersAsync } from "./services.server";

export async function loader() {
  const users = await getUsersAsync();

  return json({
    users,
  });
}

export default function SelectChapter() {
  const { users } = useLoaderData<typeof loader>();

  return (
    <>
      <Title>Users</Title>

      <div className="overflow-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th align="left" className="p-2">
                Full Name
              </th>
              <th align="left" className="p-2">
                Email
              </th>
              <th align="left" className="p-2">
                Assigned Chapter
              </th>
              <th align="right" className="p-2">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map(({ id, firstName, lastName, email, chapter }) => (
              <tr key={id}>
                <td className="border p-2">
                  {firstName} {lastName}
                </td>
                <td className="border p-2">{email}</td>
                <td className="border p-2">{chapter.name}</td>
                <td className="border p-2">
                  <Link
                    to={id.toString()}
                    className="btn-success btn-xs btn w-full gap-2 align-middle"
                  >
                    <PencilIcon className="mr-4 h-4 w-4" />
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10">
        <Link className="btn-primary btn w-96 gap-2" to="import">
          <ArrowUpTrayIcon className="h-6 w-6" />
          Import users from file
        </Link>
      </div>
    </>
  );
}
