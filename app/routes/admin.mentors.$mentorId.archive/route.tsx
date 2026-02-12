import type { Route } from "./+types/route";

import { Form, redirect } from "react-router";
import invariant from "tiny-invariant";
import { BinFull } from "iconoir-react";

import {
  deleteAzureUserAsync,
  isLoggedUserBlockedAsync,
  trackException,
} from "~/services/.server";
import { Textarea, Title } from "~/components";

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

  return redirect(`/admin/mentors/${params.mentorId}/end-reason`);
}

export default function Index({ loaderData: { user } }: Route.ComponentProps) {
  return (
    <>
      <Title>Archive &quot;{user.fullName}&quot;</Title>

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
