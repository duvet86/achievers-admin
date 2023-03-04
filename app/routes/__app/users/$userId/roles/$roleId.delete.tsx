import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";

import { Form, Link, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/server-runtime";

import invariant from "tiny-invariant";

import {
  getAzureUserWithRolesByIdAsync,
  removeRoleFromUserAsync,
} from "~/services/azure.server";

import XMarkIcon from "@heroicons/react/24/solid/XMarkIcon";
import ArrowSmallLeftIcon from "@heroicons/react/24/solid/ArrowSmallLeftIcon";

export async function loader({ params }: LoaderArgs) {
  invariant(params.userId, "userId not found");
  invariant(params.roleId, "roleId not found");

  const user = await getAzureUserWithRolesByIdAsync(params.userId);

  const roleAssignment = user.appRoleAssignments.find(
    ({ id }) => id === params.roleId
  );
  if (!roleAssignment) {
    throw new Error();
  }

  return json({
    user,
    roleAssignment,
  });
}

export async function action({ params }: ActionArgs) {
  invariant(params.userId, "userId not found");
  invariant(params.roleId, "roleId not found");

  await removeRoleFromUserAsync(params.roleId);

  return redirect(`/users/${params.userId}`);
}

export default function Delete() {
  const { user, roleAssignment } = useLoaderData<typeof loader>();

  return (
    <Form method="post">
      <h1 className="mb-4 text-xl font-medium">Unassign Chapter from User</h1>
      <div className="mb-6">
        Are you sure you want to remove the role{" "}
        <span className="font-medium">'{roleAssignment.roleName}'</span> from
        the user <span className="font-medium">'{user.email}'</span>?
      </div>

      <div className="mt-6 flex items-center space-x-6">
        <Link to="../../../" relative="path" className="btn-ghost btn">
          <ArrowSmallLeftIcon className="mr-2 w-6" />
          <span>Back</span>
        </Link>
        <button className="btn-error btn gap-2">
          <XMarkIcon className="mr-2 w-6" />
          Confirm
        </button>
      </div>
    </Form>
  );
}
