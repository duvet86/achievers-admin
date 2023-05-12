import type { ActionArgs, LoaderArgs } from "@remix-run/node";

import { Form, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";

import invariant from "tiny-invariant";

import {
  getAzureUserWithRolesByIdAsync,
  removeRoleFromUserAsync,
} from "~/services";

import { Cancel } from "iconoir-react";

import { BackHeader } from "~/components";

export async function loader({ request, params }: LoaderArgs) {
  invariant(params.userId, "userId not found");
  invariant(params.roleId, "roleId not found");

  const user = await getAzureUserWithRolesByIdAsync(request, params.userId);

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

export async function action({ request, params }: ActionArgs) {
  invariant(params.userId, "userId not found");
  invariant(params.roleId, "roleId not found");

  await removeRoleFromUserAsync(request, params.roleId);

  return redirect(`/users/${params.userId}`);
}

export default function Delete() {
  const { user, roleAssignment } = useLoaderData<typeof loader>();

  return (
    <>
      <BackHeader to="../../../" />

      <Form method="post">
        <h1 className="mb-4 text-xl font-medium">Unassign Chapter from User</h1>
        <div className="mb-6">
          Are you sure you want to remove the role{" "}
          <span className="font-medium">'{roleAssignment.roleName}'</span> from
          the user <span className="font-medium">'{user.email}'</span>?
        </div>

        <div className="mt-6">
          <button className="btn-error btn gap-2">
            <Cancel className="mr-2 w-6" />
            Confirm
          </button>
        </div>
      </Form>
    </>
  );
}
