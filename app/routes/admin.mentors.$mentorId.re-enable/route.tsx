import type { Route } from "./+types/route";

import { Form } from "react-router";
import invariant from "tiny-invariant";
import { OnTag } from "iconoir-react";

import { Message, Title } from "~/components";

import { getUserByIdAsync, updateEndDateAsync } from "./services.server";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.mentorId, "mentorId not found");

  const user = await getUserByIdAsync(Number(params.mentorId));

  return {
    user,
  };
}

export async function action({ params }: Route.ActionArgs) {
  invariant(params.mentorId, "mentorId not found");

  await updateEndDateAsync(Number(params.mentorId));

  return {
    successMessage: "User re enabled successfully",
  };
}

export default function Index({
  loaderData: { user },
  actionData,
}: Route.ComponentProps) {
  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row">
        <Title>Re enable &quot;{user.fullName}&quot;</Title>

        <Message key={Date.now()} successMessage={actionData?.successMessage} />
      </div>

      <Form method="post">
        <fieldset>
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
