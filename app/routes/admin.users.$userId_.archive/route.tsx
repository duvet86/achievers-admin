import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigation } from "@remix-run/react";

import invariant from "tiny-invariant";
import { BinFull, Xmark } from "iconoir-react";

import {
  getAzureUserWithRolesByIdAsync,
  removeRoleFromUserAsync,
  ROLE_MAPPINGS,
  trackEvent,
} from "~/services/.server";
import { Title } from "~/components";

import { archiveUserAsync, getUserByIdAsync } from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));

  return json({
    user,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));

  if (user.azureADId !== null) {
    const azureUserInfo = await getAzureUserWithRolesByIdAsync(
      request,
      user.azureADId,
    );

    const appRoleAssignmentId = azureUserInfo.appRoleAssignments.find(
      ({ appRoleId }) => ROLE_MAPPINGS.Mentor === appRoleId,
    )?.id;

    if (appRoleAssignmentId === undefined) {
      throw new Error("appRoleAssignmentId must be defined.");
    }

    await removeRoleFromUserAsync(request, appRoleAssignmentId);

    trackEvent("REVOKE_ACCESS_MENTOR");
  }

  await archiveUserAsync(user.id);

  return redirect("/admin/users");
}

export default function Chapter() {
  const transition = useNavigation();
  const { user } = useLoaderData<typeof loader>();

  return (
    <>
      <Title>Archive &quot;{user.fullName}&quot;</Title>

      <Form method="post">
        <fieldset disabled={transition.state === "submitting"}>
          <p>Are you sure you want to archive &quot;{user.fullName}&quot;?</p>

          <div className="mt-6 flex items-center justify-end gap-6">
            <Link
              className="btn btn-neutral w-44"
              to={`/admin/users/${user.id}`}
            >
              <Xmark className="h-6 w-6" />
              Cancel
            </Link>

            <button className="btn btn-error w-44 gap-4" type="submit">
              <BinFull className="h-6 w-6" />
              Archive
            </button>
          </div>
        </fieldset>
      </Form>
    </>
  );
}
