import type { LoaderArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import {
  BackHeader,
  DateInput,
  Input,
  SubmitFormButton,
  Textarea,
  Title,
} from "~/components";

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
        Approval by MRC for "{user.firstName} {user.lastName}"
      </Title>

      <Form method="post">
        <Input
          label="Completed by"
          name="completedBy"
          defaultValue={user.approvalbyMRC?.completedBy ?? ""}
          required
        />

        <DateInput
          label="Submitted date"
          name="submittedDate"
          defaultValue={user.approvalbyMRC?.submittedDate ?? ""}
          required
        />

        <Textarea
          label="Comment"
          name="comment"
          defaultValue={user.approvalbyMRC?.comment ?? ""}
        />

        <SubmitFormButton />
      </Form>
    </>
  );
}
