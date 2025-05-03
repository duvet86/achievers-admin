import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import { useActionData } from "react-router";
import { Form, useLoaderData, useNavigation } from "react-router";
import invariant from "tiny-invariant";
import { BinFull, WarningCircle } from "iconoir-react";

import { deleteAzureUserAsync } from "~/services/.server";
import { Message, Title } from "~/components";

import { getUserByIdAsync, removeUserAccessAsync } from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));
  if (user.azureADId === null) {
    throw new Error("User not part of Azure AD.");
  }

  return {
    user,
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));
  if (user.azureADId === null) {
    throw new Error("User not part of Azure AD.");
  }

  try {
    await deleteAzureUserAsync(request, user.azureADId);

    await removeUserAccessAsync(user.id);
  } catch (error) {
    return { successMessage: null, error: error as Error };
  }

  return {
    successMessage: "User access removed successfully",
    error: null,
  };
}

export default function Chapter() {
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const transition = useNavigation();

  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row">
        <Title>
          Remove access to the achievers&apos; web app for &quot;{user.fullName}
          &quot;
        </Title>

        <Message key={Date.now()} successMessage={actionData?.successMessage} />
      </div>

      <Form method="post" className="mt-4">
        <fieldset disabled={transition.state === "submitting"}>
          <p>
            Are you sure you want to remove the access of &quot;{user.fullName}
            &quot; to the achievers&apos; web app?
          </p>

          {actionData && (
            <div role="alert" className="alert alert-error mt-4">
              <WarningCircle />
              <span>{actionData?.error?.message}</span>
            </div>
          )}

          <div className="mt-6 flex items-center justify-end">
            <button className="btn btn-error w-44 gap-4" type="submit">
              <BinFull />
              Remove access
            </button>
          </div>
        </fieldset>
      </Form>
    </>
  );
}
