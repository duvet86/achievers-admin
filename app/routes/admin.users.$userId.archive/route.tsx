import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import { redirect } from "react-router";
import { Form, useLoaderData, useNavigation } from "react-router";

import invariant from "tiny-invariant";
import { BinFull } from "iconoir-react";

import { deleteAzureUserAsync } from "~/services/.server";
import { Textarea, Title } from "~/components";

import { archiveUserAsync, getUserByIdAsync } from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));

  return {
    user,
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.userId, "userId not found");

  const formData = await request.formData();
  const endReason = formData.get("endReason")?.toString();

  const user = await getUserByIdAsync(Number(params.userId));

  if (user.azureADId !== null) {
    await deleteAzureUserAsync(request, user.azureADId);
  }

  await archiveUserAsync(user.id, endReason!);

  return redirect("/admin/users");
}

export default function Chapter() {
  const transition = useNavigation();
  const { user } = useLoaderData<typeof loader>();

  return (
    <>
      <Title to={`/admin/users/${user.id}`}>
        Archive &quot;{user.fullName}&quot;
      </Title>

      <Form method="post">
        <fieldset disabled={transition.state === "submitting"}>
          <p className="my-4">
            Are you sure you want to archive &quot;{user.fullName}&quot;?
          </p>

          <Textarea placeholder="Reason to Archive" name="endReason" required />

          <div className="mt-6 flex items-center justify-end">
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
