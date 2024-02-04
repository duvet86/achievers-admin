import type { LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { ChatBubbleEmpty, Check, WarningTriangle } from "iconoir-react";

import { BackHeader, Title } from "~/components";

import { getUserByIdAsync } from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));

  return json({
    userId: params.userId,
    user,
  });
}

export default function Index() {
  const { userId, user } = useLoaderData<typeof loader>();

  return (
    <>
      <BackHeader to={`/admin/users/${userId}`} />

      <Title>
        References for "{user.firstName} {user.lastName}"
      </Title>

      <div className="overflow-auto bg-white">
        <table className="table">
          <thead>
            <tr>
              <th align="left">Full name</th>
              <th align="center" className="w-1/12">
                Completed
              </th>
              <th align="right" className="w-1/4">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {user.references.length === 0 && (
              <tr>
                <td colSpan={3} className="border">
                  <i>No References defined for this user</i>
                </td>
              </tr>
            )}
            {user.references.map(
              ({ id, firstName, lastName, calledOndate }) => (
                <tr key={id}>
                  <td className="border">
                    {firstName} {lastName}
                  </td>
                  <td className="border" align="center">
                    {calledOndate !== null ? (
                      <Check className="h-6 w-6 text-success" />
                    ) : (
                      <WarningTriangle className="h-6 w-6 text-warning" />
                    )}
                  </td>
                  <td align="right" className="border">
                    <Link
                      to={`${id}`}
                      className="btn btn-success btn-xs w-full gap-2"
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
