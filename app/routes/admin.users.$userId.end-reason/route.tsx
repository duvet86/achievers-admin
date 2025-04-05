import type { LoaderFunctionArgs } from "react-router";

import { useLoaderData } from "react-router";

import invariant from "tiny-invariant";

import { getUserByIdAsync } from "./services.server";
import { Textarea, Title } from "~/components";
import dayjs from "dayjs";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));

  return {
    ...user,
    endDate: dayjs(user.endDate).format("DD/MM/YYYY"),
  };
}

export default function Index() {
  const { fullName, endDate, endReason } = useLoaderData<typeof loader>();

  return (
    <>
      <Title>Archived Mentor</Title>

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
