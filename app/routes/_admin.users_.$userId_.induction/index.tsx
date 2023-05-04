import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import type { UpdateInductionCommand } from "./services.server";

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

import { getUserByIdAsync, updateInductionAsync } from "./services.server";

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

  const runBy = formData.get("runBy")?.toString();
  const completedOnDate = formData.get("completedOnDate")?.toString();
  const comment = formData.get("comment")?.toString() ?? null;

  if (runBy === undefined || completedOnDate === undefined) {
    return json<{
      message: string | null;
    }>({
      message: "Missing required fields",
    });
  }

  const data: UpdateInductionCommand = {
    runBy,
    completedOnDate: new Date(completedOnDate),
    comment,
  };

  await updateInductionAsync(Number(params.userId), data);

  return json<{
    message: string | null;
  }>({
    message: null,
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
        Induction acknowledgement for "{user.firstName} {user.lastName}"
      </Title>

      <Form method="post">
        <fieldset disabled={transition.state === "submitting"}>
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

          <SubmitFormButton message={actionData?.message} />
        </fieldset>
      </Form>
    </>
  );
}
