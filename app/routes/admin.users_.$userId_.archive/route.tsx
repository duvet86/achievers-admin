import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";

import invariant from "tiny-invariant";
import { BinFull } from "iconoir-react";

import {
  getAzureUserWithRolesByIdAsync,
  removeRoleFromUserAsync,
  ROLES,
  trackTrace,
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
      ({ appRoleId }) => ROLES.Mentor === appRoleId,
    )?.id;

    if (appRoleAssignmentId === undefined) {
      throw new Error("appRoleAssignmentId must be defined.");
    }

    await removeRoleFromUserAsync(request, appRoleAssignmentId);

    trackTrace({
      message: "REVOKE_ACCESS_MENTOR",
    });
  }

  await archiveUserAsync(user.id);

  return redirect("/admin/users");
}

export default function Chapter() {
  const transition = useNavigation();
  const { user } = useLoaderData<typeof loader>();

  return (
    <>
      <Title>
        Archive &quot;{user.firstName} {user.lastName}&quot;
      </Title>

      <Form method="post">
        <fieldset disabled={transition.state === "submitting"}>
          <p>
            Are you sure you want to archive &quot;{user.firstName}{" "}
            {user.lastName}&quot;?
          </p>

          <button
            className="btn btn-error float-right mt-6 w-64 gap-4"
            type="submit"
          >
            <BinFull className="h-6 w-6" />
            Archive
          </button>
        </fieldset>
      </Form>
    </>
  );
}
