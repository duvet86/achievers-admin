/* eslint-disable react-hooks/purity */
import type { Route } from "./+types/route";

import { Form } from "react-router";
import invariant from "tiny-invariant";
import { Key, WarningCircle } from "iconoir-react";

import { Message, Title } from "~/components";

import {
  getUserByIdAsync,
  inviteInternalAchieversUserAsync,
  inviteUserAsync,
} from "./services.server";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.mentorId, "mentorId not found");

  const user = await getUserByIdAsync(Number(params.mentorId));

  return {
    user,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.mentorId, "mentorId not found");

  const user = await getUserByIdAsync(Number(params.mentorId));

  try {
    if (user.email.includes("achieversclubwa.org.au")) {
      await inviteInternalAchieversUserAsync(
        request,
        user.email,
        Number(params.mentorId),
      );

      return {
        successMessage: "User invited successfully",
        error: null,
      };
    }

    await inviteUserAsync(request, user.email, Number(params.mentorId));

    return {
      successMessage: "User invited successfully",
      error: null,
    };
  } catch (error) {
    return { successMessage: null, error: error as Error };
  }
}

export default function Chapter({
  loaderData: { user },
  actionData,
}: Route.ComponentProps) {
  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row">
        <Title>
          Invite &quot;{user.fullName}&quot; to the achievers&apos; web app
        </Title>

        <Message key={Date.now()} successMessage={actionData?.successMessage} />
      </div>

      <Form method="post" className="mt-4">
        <fieldset>
          <p>
            Are you sure you want to invite &quot;{user.fullName}&quot; to the
            achievers&apos; web app?
          </p>

          {actionData?.error && (
            <div role="alert" className="alert alert-error mt-4">
              <WarningCircle />
              <span>{actionData?.error?.message}</span>
            </div>
          )}

          <div className="mt-6 flex items-center justify-end">
            <button className="btn btn-success w-44 gap-4" type="submit">
              <Key className="h-6 w-6" />
              Give access
            </button>
          </div>
        </fieldset>
      </Form>
    </>
  );
}
