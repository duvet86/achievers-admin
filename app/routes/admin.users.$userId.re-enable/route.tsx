import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import { redirect } from "react-router";
import { Form, useLoaderData, useNavigation } from "react-router";
import invariant from "tiny-invariant";
import { OnTag } from "iconoir-react";

import { Title } from "~/components";

import { getUserByIdAsync, updateEndDateAsync } from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));

  return {
    user,
  };
}

export async function action({ params }: ActionFunctionArgs) {
  invariant(params.userId, "userId not found");

  await updateEndDateAsync(Number(params.userId));

  return redirect(`/admin/users/${params.userId}`);
}

export default function Index() {
  const transition = useNavigation();
  const { user } = useLoaderData<typeof loader>();

  return (
    <>
      <Title to={`/admin/users/${user.id}`}>
        Re enable &quot;{user.fullName}&quot;
      </Title>

      <Form method="post">
        <fieldset disabled={transition.state !== "idle"}>
          <p>
            Are you sure you want to re enable &quot;{user.fullName}
            &quot;?
          </p>

          <div className="mt-6 flex items-center justify-end">
            <button className="btn btn-success w-44 gap-4" type="submit">
              <OnTag className="h-6 w-6" />
              Re enable
            </button>
          </div>
        </fieldset>
      </Form>
    </>
  );
}
