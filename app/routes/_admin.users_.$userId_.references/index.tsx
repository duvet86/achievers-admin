import type { LoaderArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { ChatBubbleEmpty, Check, WarningTriangle } from "iconoir-react";

import { BackHeader, Title } from "~/components";

import { getUserByIdAsync } from "./services.server";

export async function loader({ params }: LoaderArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));

  return json({
    user,
  });
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <>
      <BackHeader />

      <Title>
        References for "{user.firstName} {user.lastName}"
      </Title>

      <div className="overflow-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th align="left" className="p-2">
                Full name
              </th>
              <th align="center" className="w-1/12 p-2">
                Completed
              </th>
              <th align="right" className="w-1/4 p-2">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {user.references.length === 0 && (
              <tr>
                <td colSpan={3} className="border p-2">
                  <i>No References defined for this user</i>
                </td>
              </tr>
            )}
            {user.references.map(
              ({ id, firstName, lastName, calledOndate }) => (
                <tr key={id}>
                  <td className="border p-2">
                    {firstName} {lastName}
                  </td>
                  <td className="border p-2" align="center">
                    {calledOndate !== null ? (
                      <Check className="h-6 w-6 text-success" />
                    ) : (
                      <WarningTriangle className="h-6 w-6 text-warning" />
                    )}
                  </td>
                  <td align="right" className="border p-2">
                    <Link
                      to={`${id}`}
                      relative="path"
                      className="btn-success btn-xs btn w-full gap-2"
                    >
                      <ChatBubbleEmpty className="h-4 w-4" />
                      View
                    </Link>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
