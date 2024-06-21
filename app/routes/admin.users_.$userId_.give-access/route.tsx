import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigation } from "@remix-run/react";

import invariant from "tiny-invariant";

import { Xmark, Key } from "iconoir-react";

import { Title } from "~/components";

import { getUserByIdAsync, updateAzureIdAsync } from "./services.server";
import {
  APP_ID,
  assignRoleToUserAsync,
  inviteUserToAzureAsync,
  ROLE_MAPPINGS,
  trackTrace,
} from "~/services/.server";
import { getCurrentHost } from "~/services";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));
  if (user.azureADId !== null) {
    throw new Error("User already part of Azure AD.");
  }

  return json({
    user,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));

  const inviteUserToAzureResponse = await inviteUserToAzureAsync(request, {
    invitedUserEmailAddress: user.email,
    inviteRedirectUrl: getCurrentHost(request),
    sendInvitationMessage: true,
  });

  trackTrace({
    message: "GIVE_ACCESS_MENTOR",
    properties: inviteUserToAzureResponse,
  });

  const azureUserId = inviteUserToAzureResponse.invitedUser.id;

  const assignRoleResponse = await assignRoleToUserAsync(request, azureUserId, {
    principalId: azureUserId,
    appRoleId: ROLE_MAPPINGS.Mentor,
    resourceId: APP_ID,
  });

  trackTrace({
    message: "ASSIGN_ROLE_TO_MENTOR",
    properties: assignRoleResponse,
  });

  await updateAzureIdAsync(Number(params.userId), azureUserId);

  return redirect(`/admin/users/${params.userId}`);
}

export default function Chapter() {
  const transition = useNavigation();
  const { user } = useLoaderData<typeof loader>();

  return (
    <>
      <Title>
        Invite &quot;{user.fullName}&quot; to the achievers&apos; web app
      </Title>

      <Form method="post">
        <fieldset disabled={transition.state === "submitting"}>
          <p>
            Are you sure you want to invite &quot;{user.fullName}&quot; to the
            achievers&apos; web app?
          </p>

          <div className="mt-6 flex items-center justify-end gap-6">
            <Link
              className="btn btn-neutral w-44"
              to={`/admin/users/${user.id}`}
            >
              <Xmark className="h-6 w-6" />
              Cancel
            </Link>

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
