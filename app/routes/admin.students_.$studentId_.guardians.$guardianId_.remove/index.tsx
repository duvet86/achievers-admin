import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import invariant from "tiny-invariant";

import { Title } from "~/components";

import {
  getGuardianByIdAsync,
  deleteGuardianByIdAsync,
} from "./services.server";
import { Xmark } from "iconoir-react";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.studentId, "studentId not found");
  invariant(params.guardianId, "guardianId not found");

  const guardian = await getGuardianByIdAsync(Number(params.guardianId));
  if (guardian === null) {
    throw new Response("Not Found", {
      status: 404,
    });
  }

  return json({
    guardian,
  });
}

export async function action({ params }: ActionFunctionArgs) {
  invariant(params.studentId, "studentId not found");
  invariant(params.guardianId, "guardianId not found");

  await deleteGuardianByIdAsync(Number(params.guardianId));

  return redirect(`/admin/students/${params.studentId}`);
}

export default function Index() {
  const { guardian } = useLoaderData<typeof loader>();
  const transition = useNavigation();

  return (
    <>
      <Title>Remove guardian &quot;{guardian.fullName}&quot;</Title>

      <Form method="post">
        <fieldset disabled={transition.state === "loading"}>
          <article className="prose max-w-none">
            <h3>
              Are you sure you want to remove &quot;{guardian.fullName}&quot;
              from student &quot;{guardian.student.firstName}{" "}
              {guardian.student.lastName}
              &quot;?
            </h3>
          </article>

          <div className="float-right">
            <button className="btn btn-error w-52 gap-5" type="submit">
              <Xmark className="h-6 w-6" />
              Remove
            </button>
          </div>
        </fieldset>
      </Form>
    </>
  );
}
