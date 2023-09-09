import type { ActionArgs, LoaderArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";

import invariant from "tiny-invariant";

import { Cancel } from "iconoir-react";

import { Title, BackHeader } from "~/components";

import { removeRoleFromUserAsync, trackTrace } from "~/services";

import { getUserByIdAsync, archiveUserAsync } from "./services.server";

export async function loader({ params }: LoaderArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));
  if (user.azureADId === null) {
    throw new Error("User not in Azure AD.");
  }

  return json({
    user,
  });
}

export async function action({ request, params }: ActionArgs) {
  invariant(params.userId, "userId not found");
  invariant(params.appRoleAssignmentId, "appRoleAssignmentId not found");

  await removeRoleFromUserAsync(request, params.appRoleAssignmentId);

  await archiveUserAsync(Number(params.userId));

  trackTrace({
    message: "REVOKE_ACCESS_MENTOR",
  });

  return redirect(`/users/${params.userId}`);
}

export default function Index() {
  const transition = useNavigation();
  const { user } = useLoaderData<typeof loader>();

  return (
    <>
      <BackHeader />

      <Title>
        Archive "{user.firstName} {user.lastName}"
      </Title>

      <Form method="post">
        <fieldset disabled={transition.state === "submitting"}>
          <p>
            Are you sure you want to archive "{user.firstName} {user.lastName}"?
          </p>

          <button
            className="btn btn-error float-right mt-6 w-64 gap-4"
            type="submit"
          >
            <Cancel className="h-6 w-6" />
            Archive mentor
          </button>
        </fieldset>
      </Form>
    </>
  );
}
