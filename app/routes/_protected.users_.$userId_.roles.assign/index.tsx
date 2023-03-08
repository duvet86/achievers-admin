import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";

import { json, redirect } from "@remix-run/server-runtime";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";

import invariant from "tiny-invariant";

import {
  APP_ID,
  getAzureRolesAsync,
  getAzureUserWithRolesByIdAsync,
  getSessionUserAsync,
} from "~/services";

import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import ArrowSmallLeftIcon from "@heroicons/react/24/solid/ArrowSmallLeftIcon";

import Select from "~/components/Select";

import { assignRoleToUserAsync } from "./services.server";

export async function loader({ request, params }: LoaderArgs) {
  invariant(params.userId, "userId not found");

  const sessionUser = await getSessionUserAsync(request);

  const [user, appRoles] = await Promise.all([
    getAzureUserWithRolesByIdAsync(sessionUser.accessToken, params.userId),
    getAzureRolesAsync(sessionUser.accessToken),
  ]);

  return json({
    user,
    appRoles,
  });
}

export async function action({ request, params }: ActionArgs) {
  invariant(params.userId, "userId not found");

  const sessionUser = await getSessionUserAsync(request);

  const formData = await request.formData();

  const roleId = formData.get("roleId");

  if (!roleId) {
    return json({
      error: "Select a Role please.",
    });
  }

  await assignRoleToUserAsync(sessionUser.accessToken, {
    principalId: params.userId,
    appRoleId: roleId.toString(),
    resourceId: APP_ID,
  });

  return redirect(`/users/${params.userId}`);
}

export default function Assign() {
  const { user, appRoles } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const transition = useTransition();

  const isSubmitting = transition.state === "submitting";

  return (
    <Form method="post">
      <h1 className="mb-4 text-xl font-medium">
        Assing a Role to the <span className="font-medium">'{user.email}'</span>
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

      <p className="mt-4 text-red-600">{actionData?.error}</p>

      <div className="mt-6 flex items-center space-x-6">
        <Link
          to="../../"
          relative="path"
          className="btn-ghost btn"
          type="submit"
        >
          <ArrowSmallLeftIcon className="w-6" />
          Back
        </Link>
        <button className="btn-primary btn gap-2">
          <PlusIcon className="h-6 w-6" />
          Save
        </button>
      </div>
    </Form>
  );
}
