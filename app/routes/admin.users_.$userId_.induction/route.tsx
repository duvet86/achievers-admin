import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
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
  DateInput,
  Input,
  Textarea,
  Title,
  SubmitFormButton,
} from "~/components";

import { getUserByIdAsync, updateInductionAsync } from "./services.server";

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

  const runBy = formData.get("runBy")?.toString();
  const completedOnDate = formData.get("completedOnDate")?.toString();
  const comment = formData.get("comment")?.toString() ?? null;

  if (runBy === undefined || completedOnDate === undefined) {
    return json({
      errorMessage: "Missing required fields",
    });
  }

  const data: UpdateInductionCommand = {
    runBy,
    completedOnDate: new Date(completedOnDate),
    comment,
  };

  await updateInductionAsync(Number(params.userId), data);

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
      <Title to={`/admin/users/${user.id}`}>
        Induction acknowledgement for &quot;{user.fullName}
        &quot;
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

          <SubmitFormButton
            errorMessage={actionData?.errorMessage}
            className="mt-6 justify-between"
          />
        </fieldset>
      </Form>
    </>
  );
}
