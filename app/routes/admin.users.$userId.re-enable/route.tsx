import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import { useActionData } from "react-router";
import { Form, useLoaderData, useNavigation } from "react-router";
import invariant from "tiny-invariant";
import { OnTag } from "iconoir-react";

import { Message, Title } from "~/components";

import { getUserByIdAsync, updateEndDateAsync } from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));

  return {
    user,
  };
}

export async function action({ params }: ActionFunctionArgs) {
  invariant(params.userId, "userId not found");

  await updateEndDateAsync(Number(params.userId));

  return {
    successMessage: "User re enabled successfully",
  };
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const transition = useNavigation();

  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row">
        <Title>Re enable &quot;{user.fullName}&quot;</Title>

        <Message key={Date.now()} successMessage={actionData?.successMessage} />
      </div>

      <Form method="post">
        <fieldset disabled={transition.state !== "idle"}>
          <p>
            Are you sure you want to re enable &quot;{user.fullName}
            &quot;?
          </p>

          <div className="mt-6 flex items-center justify-end">
            <button className="btn btn-success w-44 gap-4" type="submit">
              <OnTag className="h-6 w-6" />
              Re enable
            </button>
          </div>
        </fieldset>
      </Form>
    </>
  );
}
