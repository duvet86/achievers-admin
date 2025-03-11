import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import { redirect, useActionData } from "react-router";
import { Form, useLoaderData, useNavigation } from "react-router";
import invariant from "tiny-invariant";
import { Key, WarningCircle } from "iconoir-react";

import { Title } from "~/components";

import { getUserByIdAsync, updateAzureIdAsync } from "./services.server";
import {
  APP_ID,
  assignRoleToUserAsync,
  getAzureUserByAzureEmailAsync,
  inviteUserToAzureAsync,
  MENTOR_ROLE_APP_ID,
  trackEvent,
} from "~/services/.server";
import { getCurrentHost } from "~/services";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));

  return {
    user,
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));

  let azureUserId: string;

  try {
    if (user.azureADId !== null) {
      azureUserId = user.azureADId;
    } else if (user.email.includes("achieversclubwa.org.au")) {
      const azureUser = await getAzureUserByAzureEmailAsync(
        request,
        user.email,
      );

      azureUserId = azureUser.id;
    } else {
      const inviteUserToAzureResponse = await inviteUserToAzureAsync(request, {
        invitedUserEmailAddress: user.email,
        inviteRedirectUrl: getCurrentHost(request),
        sendInvitationMessage: true,
      });

      trackEvent("GIVE_ACCESS_MENTOR", {
        id: inviteUserToAzureResponse.id,
      });

      azureUserId = inviteUserToAzureResponse.invitedUser.id;
    }

    const assignRoleResponse = await assignRoleToUserAsync(
      request,
      azureUserId,
      {
        principalId: azureUserId,
        appRoleId: MENTOR_ROLE_APP_ID,
        resourceId: APP_ID,
      },
    );

    trackEvent("ASSIGN_ROLE_TO_MENTOR", {
      id: assignRoleResponse.id,
    });

    await updateAzureIdAsync(Number(params.userId), azureUserId);

    return redirect(`/admin/users/${params.userId}`);
  } catch (error) {
    return { error: error as Error };
  }
}

export default function Chapter() {
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const transition = useNavigation();

  return (
    <>
      <Title to={`/admin/users/${user.id}`}>
        Invite &quot;{user.fullName}&quot; to the achievers&apos; web app
      </Title>

      <Form method="post" className="mt-4">
        <fieldset disabled={transition.state === "submitting"}>
          <p>
            Are you sure you want to invite &quot;{user.fullName}&quot; to the
            achievers&apos; web app?
          </p>

          {actionData && (
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
