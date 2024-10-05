import type { LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { ChatBubbleEmpty, Check, WarningTriangle, Xmark } from "iconoir-react";

import { Title } from "~/components";

import { getUserByIdAsync } from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
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
      <Title to={`/admin/users/${user.id}`}>
        References for &quot;{user.fullName}&quot;
      </Title>

      <div className="overflow-auto bg-white">
        <table className="table">
          <thead>
            <tr>
              <th align="center">Full Name</th>
              <th align="center" className="w-1/12">
                Completed
              </th>
              <th align="center" className="w-1/4">
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
              ({ id, fullName, calledOndate, isRejected }) => (
                <tr key={id}>
                  <td className="border">{fullName}</td>
                  <td className="border" align="center">
                    {isRejected ? (
                      <Xmark className="text-danger h-6 w-6" />
                    ) : calledOndate !== null ? (
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
