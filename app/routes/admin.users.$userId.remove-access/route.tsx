import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import { redirect } from "react-router";
import { Form, useLoaderData, useNavigation } from "react-router";
import invariant from "tiny-invariant";
import { BinFull } from "iconoir-react";

import { deleteAzureUserAsync } from "~/services/.server";
import { Title } from "~/components";

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

  await deleteAzureUserAsync(request, user.azureADId);

  await removeUserAccessAsync(user.id);

  return redirect(`/admin/users/${params.userId}`);
}

export default function Chapter() {
  const transition = useNavigation();
  const { user } = useLoaderData<typeof loader>();

  return (
    <>
      <Title to={`/admin/users/${user.id}`}>
        Remove access to the achievers&apos; web app for &quot;{user.fullName}
        &quot;
      </Title>

      <Form method="post">
        <fieldset disabled={transition.state === "submitting"}>
          <p>
            Are you sure you want to remove the access of &quot;{user.fullName}
            &quot; to the achievers&apos; web app?
          </p>

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
