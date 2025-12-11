/* eslint-disable react-hooks/purity */
import type { Route } from "./+types/route";

import { Form, redirect } from "react-router";
import invariant from "tiny-invariant";
import { BinFull } from "iconoir-react";

import {
  deleteAzureUserAsync,
  isLoggedUserBlockedAsync,
  trackException,
} from "~/services/.server";
import { Message, Textarea, Title } from "~/components";

import { archiveUserAsync, getUserByIdAsync } from "./services.server";

export async function loader({ params, request }: Route.LoaderArgs) {
  invariant(params.mentorId, "mentorId not found");

  const isUserBlocked = await isLoggedUserBlockedAsync(request, "Restricted");
  if (isUserBlocked) {
    trackException(
      new Error(
        `Request url: ${request.url}. loggedUser has no Restricted permissions.`,
      ),
    );
    throw redirect("/403");
  }

  const user = await getUserByIdAsync(Number(params.mentorId));

  return {
    user,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.mentorId, "mentorId not found");

  const formData = await request.formData();
  const endReason = formData.get("endReason")?.toString();

  const user = await getUserByIdAsync(Number(params.mentorId));

  if (user.azureADId !== null) {
    await deleteAzureUserAsync(request, user.azureADId);
  }

  await archiveUserAsync(user.id, endReason!);

  return {
    successMessage: "User archived successfully",
  };
}

export default function Index({
  loaderData: { user },
  actionData,
}: Route.ComponentProps) {
  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row">
        <Title>Archive &quot;{user.fullName}&quot;</Title>

        <Message key={Date.now()} successMessage={actionData?.successMessage} />
      </div>

      <Form method="post">
        <fieldset>
          <p className="my-4">
            Are you sure you want to archive &quot;{user.fullName}&quot;?
          </p>

          <Textarea placeholder="Reason to Archive" name="endReason" required />

          <div className="mt-6 flex items-center justify-end">
            <button className="btn btn-error w-44 gap-4" type="submit">
              <BinFull />
              Archive
            </button>
          </div>
        </fieldset>
      </Form>
    </>
  );
}
