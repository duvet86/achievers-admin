import type { ActionArgs, LoaderArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";

import invariant from "tiny-invariant";

import {
  APP_ID,
  getAzureRolesAsync,
  getAzureUserWithRolesByIdAsync,
  assignRoleToUserAsync,
} from "~/services";

import { Select, BackHeader, SubmitFormButton } from "~/components";
import { getUserByIdAsync } from "./services.server";

export async function loader({ request, params }: LoaderArgs) {
  invariant(params.userId, "userId not found");

  const [user, appRoles] = await Promise.all([
    getAzureUserWithRolesByIdAsync(request, params.userId),
    getAzureRolesAsync(request),
  ]);

  return json({
    user,
    appRoles,
  });
}

export async function action({ request, params }: ActionArgs) {
  invariant(params.userId, "userId not found");

  const formData = await request.formData();

  const roleId = formData.get("roleId");

  if (!roleId) {
    return json({
      error: "Select a Role please.",
    });
  }

  const { azureADId } = await getUserByIdAsync(Number(params.userId));
  if (azureADId === null) {
    throw new Error();
  }

  await assignRoleToUserAsync(request, azureADId, {
    principalId: azureADId,
    appRoleId: roleId.toString(),
    resourceId: APP_ID,
  });

  return redirect(`/users/${params.userId}`);
}

export default function Assign() {
  const { user, appRoles } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const transition = useNavigation();

  const isSubmitting = transition.state === "submitting";

  return (
    <>
      <BackHeader to="../../" />

      <Form method="post">
        <h1 className="mb-4 text-xl font-medium">
          Assing a Role to the{" "}
          <span className="font-medium">'{user.email}'</span>
        </h1>

        <Select
          label="Select a Role"
          name="roleId"
          disabled={isSubmitting}
          options={[{ value: "", label: "Select a Role" }].concat(
            appRoles.map(({ id, displayName }) => ({
              label: displayName,
              value: id,
            }))
          )}
        />

        <SubmitFormButton message={actionData?.error} />
      </Form>
    </>
  );
}
