import type { LoaderArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import {
  BackHeader,
  DateInput,
  Title,
  FileInput,
  Input,
  SubmitFormButton,
} from "~/components";

import { getFileUrl, getUserByIdAsync } from "./services.server";

export async function loader({ params }: LoaderArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));

  const filePath = user?.wwcCheck?.filePath
    ? await getFileUrl(user.wwcCheck.filePath)
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
        WWC check for "{user.firstName} {user.lastName}"
      </Title>

      <Form method="post" encType="multipart/form-data">
        <FileInput label="Police check file" name="filePath" required />

        <Input
          defaultValue={user?.wwcCheck?.wwcNumber ?? ""}
          label="WWC number"
          name="wwcNumber"
          required
        />

        <DateInput
          defaultValue={user.wwcCheck?.expiryDate ?? ""}
          label="Expiry date"
          name="expiryDate"
          required
        />

        <SubmitFormButton />
      </Form>

      {user.filePath && (
        <a href={user.filePath} className="link-primary link p-2" download>
          Downlod file
        </a>
      )}
    </>
  );
}
