import type { LoaderArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import ServerIcon from "@heroicons/react/24/solid/ServerIcon";

import BackHeader from "~/components/BackHeader";
import DateInput from "~/components/DateInput";
import Title from "~/components/Title";

import { getFileUrl, getUserByIdAsync } from "./services.server";
import FileInput from "~/components/FileInput";

export async function loader({ params }: LoaderArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));

  const filePath = user?.policeCheck?.filePath
    ? await getFileUrl(user.policeCheck.filePath)
    : null;

  return json({
    user: {
      ...user,
      filePath,
    },
  });
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <>
      <BackHeader />

      <Title>
        Welcome call acknowledgement for "{user.firstName} {user.lastName}"
      </Title>

      <Form method="post" encType="multipart/form-data">
        <FileInput label="Police check file" name="filePath" required />

        <DateInput
          defaultValue={
            user.policeCheck && user.policeCheck.expiryDate
              ? new Date(user.policeCheck.expiryDate)
              : ""
          }
          label="Expiry date"
          name="expiryDate"
          required
        />

        <button
          className="btn-primary btn float-right mt-6 w-52 gap-4"
          type="submit"
        >
          <ServerIcon className="h-6 w-6" />
          Save
        </button>
      </Form>

      {user.filePath && (
        <a href={user.filePath} className="link-primary link p-2" download>
          Downlod file
        </a>
      )}
    </>
  );
}
