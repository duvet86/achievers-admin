import type { LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import invariant from "tiny-invariant";

import { getUserByIdAsync } from "./services.server";
import { Textarea, Title } from "~/components";
import dayjs from "dayjs";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));

  return json({
    ...user,
    endDate: dayjs(user.endDate).format("DD/MM/YYYY"),
  });
}

export default function Index() {
  const { id, fullName, endDate, endReason } = useLoaderData<typeof loader>();

  return (
    <>
      <Title to={`/admin/users/${id}`}>Archived Mentor</Title>

      <p className="mt-4">
        Mentor: <span className="font-bold">{fullName}</span>
      </p>

      <p className="mt-4">
        Archived on: <span className="font-bold">{endDate}</span>
      </p>

      <p className="my-4">Reason:</p>

      <Textarea defaultValue={endReason ?? ""} readOnly disabled />
    </>
  );
}
