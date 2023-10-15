import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import type { UpdateApprovalByMRCCommand } from "./services.server";

import { json } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import {
  BackHeader,
  DateInput,
  Input,
  SubmitFormButton,
  Textarea,
  Title,
} from "~/components";

import { getUserByIdAsync, updateApprovalByMRCAsync } from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));

  return json({
    user,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.userId, "userId not found");

  const formData = await request.formData();

  const completedBy = formData.get("completedBy")?.toString();
  const submittedDate = formData.get("submittedDate")?.toString();
  const comment = formData.get("comment")?.toString() ?? null;

  if (completedBy === undefined || submittedDate === undefined) {
    return json({
      errorMessage: "Missing required fields",
    });
  }

  const data: UpdateApprovalByMRCCommand = {
    completedBy,
    submittedDate,
    comment,
  };

  await updateApprovalByMRCAsync(Number(params.userId), data);

  return json({
    errorMessage: null,
  });
}

export default function Index() {
  const transition = useNavigation();
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <>
      <BackHeader />

      <Title>
        Approval by MRC for "{user.firstName} {user.lastName}"
      </Title>

      <Form method="post">
        <fieldset disabled={transition.state === "submitting"}>
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

          <SubmitFormButton
            errorMessage={actionData?.errorMessage}
            className="mt-6 justify-between"
          />
        </fieldset>
      </Form>
    </>
  );
}
