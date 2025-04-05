import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import type { UpdateWelcomeCallCommand } from "./services.server";

import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import invariant from "tiny-invariant";

import {
  DateInput,
  Input,
  Textarea,
  Title,
  SubmitFormButton,
} from "~/components";

import { getUserByIdAsync, updateWelcomeCallAsync } from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));

  return {
    user,
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.userId, "userId not found");

  const formData = await request.formData();

  const calledBy = formData.get("calledBy")?.toString();
  const calledOnDate = formData.get("calledOnDate")?.toString();
  const comment = formData.get("comment")?.toString() ?? null;

  if (calledBy === undefined || calledOnDate === undefined) {
    return {
      errorMessage: "Missing required fields",
    };
  }

  const data: UpdateWelcomeCallCommand = {
    calledBy,
    calledOnDate: new Date(calledOnDate),
    comment,
  };

  await updateWelcomeCallAsync(Number(params.userId), data);

  return {
    errorMessage: null,
  };
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const transition = useNavigation();

  return (
    <>
      <Title>
        Welcome call acknowledgement for &quot;{user.fullName}
        &quot;
      </Title>

      <hr className="my-4" />

      <Form method="post">
        <fieldset
          className="fieldset"
          disabled={transition.state === "submitting"}
        >
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
