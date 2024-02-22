import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";

import invariant from "tiny-invariant";

import { OnTag } from "iconoir-react";

import { Title, BackHeader } from "~/components";

import { getUserByIdAsync, updateEndDateAsync } from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));

  return json({
    userId: params.userId,
    user,
  });
}

export async function action({ params }: ActionFunctionArgs) {
  invariant(params.userId, "userId not found");

  await updateEndDateAsync(Number(params.userId));

  return redirect(`/admin/users/${params.userId}`);
}

export default function Index() {
  const transition = useNavigation();
  const { userId, user } = useLoaderData<typeof loader>();

  return (
    <>
      <BackHeader to={`/admin/users/${userId}`} />

      <Title>
        Re enable &quot;{user.firstName} {user.lastName}&quot;
      </Title>

      <Form method="post">
        <fieldset disabled={transition.state === "loading"}>
          <p>
            Are you sure you want to re enable &quot;{user.firstName}{" "}
            {user.lastName}
            &quot;?
          </p>

          <button
            className="btn btn-success float-right mt-6 w-64 gap-4"
            type="submit"
          >
            <OnTag className="h-6 w-6" />
            Re enable
          </button>
        </fieldset>
      </Form>
    </>
  );
}
