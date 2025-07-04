import type { Route } from "./+types/route";
import type { UpdateWelcomeCallCommand } from "./services.server";

import { Form } from "react-router";
import invariant from "tiny-invariant";

import {
  DateInput,
  Input,
  Textarea,
  Title,
  SubmitFormButton,
} from "~/components";

import { getUserByIdAsync, updateWelcomeCallAsync } from "./services.server";

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

  const calledBy = formData.get("calledBy")?.toString();
  const calledOnDate = formData.get("calledOnDate")?.toString();
  const comment = formData.get("comment")?.toString() ?? null;

  if (calledBy === undefined || calledOnDate === undefined) {
    return {
      successMessage: null,
      errorMessage: "Missing required fields",
    };
  }

  const data: UpdateWelcomeCallCommand = {
    calledBy,
    calledOnDate: new Date(calledOnDate),
    comment,
  };

  await updateWelcomeCallAsync(Number(params.mentorId), data);

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
        Welcome call acknowledgement for &quot;{user.fullName}
        &quot;
      </Title>

      <hr className="my-4" />

      <Form method="post">
        <fieldset className="fieldset">
          <Input
            label="Called by"
            name="calledBy"
            defaultValue={user.welcomeCall?.calledBy ?? ""}
            required
          />

          <DateInput
            defaultValue={user.welcomeCall?.calledOnDate ?? ""}
            label="Called on date"
            name="calledOnDate"
            required
          />

          <Textarea
            label="Comment"
            name="comment"
            defaultValue={user.welcomeCall?.comment ?? ""}
            required
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
