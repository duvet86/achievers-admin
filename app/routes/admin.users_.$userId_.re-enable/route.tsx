import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigation } from "@remix-run/react";

import invariant from "tiny-invariant";

import { OnTag, Xmark } from "iconoir-react";

import { Title } from "~/components";

import { getUserByIdAsync, updateEndDateAsync } from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));

  return json({
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
  const { user } = useLoaderData<typeof loader>();

  return (
    <>
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

          <div className="mt-6 flex items-center justify-end gap-6">
            <Link
              className="btn btn-neutral w-44"
              to={`/admin/users/${user.id}`}
            >
              <Xmark className="h-6 w-6" />
              Cancel
            </Link>

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
