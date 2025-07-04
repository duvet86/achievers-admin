import type { Route } from "./+types/route";
import type { UpdateApprovalByMRCCommand } from "./services.server";

import { Form } from "react-router";
import invariant from "tiny-invariant";

import {
  DateInput,
  Input,
  SubmitFormButton,
  Textarea,
  Title,
} from "~/components";

import { getUserByIdAsync, updateApprovalByMRCAsync } from "./services.server";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.mentorId, "mentorId not found");

  const user = await getUserByIdAsync(Number(params.mentorId));

  return {
    user,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.mentorId, "mentorId not found");

  const formData = await request.formData();

  const completedBy = formData.get("completedBy")?.toString();
  const submittedDate = formData.get("submittedDate")?.toString();
  const comment = formData.get("comment")?.toString() ?? null;

  if (completedBy === undefined || submittedDate === undefined) {
    return {
      successMessage: null,
      errorMessage: "Missing required fields",
    };
  }

  const data: UpdateApprovalByMRCCommand = {
    completedBy,
    submittedDate,
    comment,
  };

  await updateApprovalByMRCAsync(Number(params.mentorId), data);

  return {
    successMessage: "Success",
    errorMessage: null,
  };
}

export default function Index({
  loaderData: { user },
  actionData,
}: Route.ComponentProps) {
  return (
    <>
      <Title>Approval by MRC for &quot;{user.fullName}&quot;</Title>

      <hr className="my-4" />

      <Form method="post">
        <fieldset className="fieldset">
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
            successMessage={actionData?.successMessage}
            errorMessage={actionData?.errorMessage}
            className="mt-6 justify-between"
          />
        </fieldset>
      </Form>
    </>
  );
}
