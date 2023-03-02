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
  assignRoleToUserAsync,
  getAzureRolesAsync,
  getAzureUserWithRolesByIdAsync,
} from "~/services/azure.server";

import PlusIcon from "@heroicons/react/24/solid/PlusIcon";
import ArrowSmallLeftIcon from "@heroicons/react/24/solid/ArrowSmallLeftIcon";

export async function loader({ params }: LoaderArgs) {
  invariant(params.userId, "userId not found");

  const [user, appRoles] = await Promise.all([
    getAzureUserWithRolesByIdAsync(params.userId),
    getAzureRolesAsync(),
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

  await assignRoleToUserAsync({
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
        Assing a Role to the User{" "}
        <span className="font-medium">'{user.displayName}'</span>
      </h1>

      <label
        htmlFor="roleId"
        className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
      >
        Select a Role
      </label>
      <select
        name="roleId"
        className="mb-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        defaultValue=""
        disabled={isSubmitting}
      >
        <option value="">Select a Role</option>
        {appRoles.map(({ id, displayName }) => (
          <option key={id} value={id}>
            {displayName}
          </option>
        ))}
      </select>

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
        <button className="btn gap-2">
          <PlusIcon className="w-6 text-white" />
          Save
        </button>
      </div>
    </Form>
  );
}
