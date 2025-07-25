import type { Route } from "./+types/route";
import type { UpdateInductionCommand } from "./services.server";

import { Form } from "react-router";
import invariant from "tiny-invariant";

import {
  DateInput,
  Input,
  Textarea,
  Title,
  SubmitFormButton,
} from "~/components";

import { getUserByIdAsync, updateInductionAsync } from "./services.server";

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

  const runBy = formData.get("runBy")?.toString();
  const completedOnDate = formData.get("completedOnDate")?.toString();
  const comment = formData.get("comment")?.toString() ?? null;

  if (runBy === undefined || completedOnDate === undefined) {
    return {
      successMessage: null,
      errorMessage: "Missing required fields",
    };
  }

  const data: UpdateInductionCommand = {
    runBy,
    completedOnDate: new Date(completedOnDate),
    comment,
  };

  await updateInductionAsync(Number(params.mentorId), data);

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
      <Title>
        Induction acknowledgement for &quot;{user.fullName}
        &quot;
      </Title>

      <hr className="my-4" />

      <Form method="post">
        <fieldset className="fieldset">
          <Input
            label="Run by"
            name="runBy"
            defaultValue={user.induction?.runBy ?? ""}
            required
          />

          <DateInput
            defaultValue={user.induction?.completedOnDate ?? ""}
            label="Completed on date"
            name="completedOnDate"
            required
          />

          <Textarea
            label="Comment"
            name="comment"
            defaultValue={user.induction?.comment ?? ""}
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
