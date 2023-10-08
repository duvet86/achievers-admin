import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import type { UpdateWelcomeCallCommand } from "./services.server";

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
  Textarea,
  Title,
  SubmitFormButton,
} from "~/components";

import { getUserByIdAsync, updateWelcomeCallAsync } from "./services.server";

export async function loader({ params }: LoaderArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));

  return json({
    user,
  });
}

export async function action({ request, params }: ActionArgs) {
  invariant(params.userId, "userId not found");

  const formData = await request.formData();

  const calledBy = formData.get("calledBy")?.toString();
  const calledOnDate = formData.get("calledOnDate")?.toString();
  const comment = formData.get("comment")?.toString() ?? null;

  if (calledBy === undefined || calledOnDate === undefined) {
    return json({
      errorMessage: "Missing required fields",
    });
  }

  const data: UpdateWelcomeCallCommand = {
    calledBy,
    calledOnDate: new Date(calledOnDate),
    comment,
  };

  await updateWelcomeCallAsync(Number(params.userId), data);

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
        Welcome call acknowledgement for "{user.firstName} {user.lastName}"
      </Title>

      <Form method="post">
        <fieldset disabled={transition.state === "submitting"}>
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
            errorMessage={actionData?.errorMessage}
            className="mt-6 justify-between"
          />
        </fieldset>
      </Form>
    </>
  );
}
