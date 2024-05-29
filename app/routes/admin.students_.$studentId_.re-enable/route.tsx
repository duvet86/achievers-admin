import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import invariant from "tiny-invariant";
import { OnTag } from "iconoir-react";

import { Title } from "~/components";

import { getStudentByIdAsync, updateEndDateAsync } from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.studentId, "studentId not found");

  const student = await getStudentByIdAsync(Number(params.studentId));

  return json({
    student,
  });
}

export async function action({ params }: ActionFunctionArgs) {
  invariant(params.studentId, "studentId not found");

  await updateEndDateAsync(Number(params.studentId));

  return redirect(`/admin/students/${params.studentId}`);
}

export default function Index() {
  const transition = useNavigation();
  const { student } = useLoaderData<typeof loader>();

  return (
    <>
      <Title>
        Re enable &quot;{student.firstName} {student.lastName}&quot;
      </Title>

      <Form method="post">
        <fieldset disabled={transition.state === "loading"}>
          <p>
            Are you sure you want to re enable &quot;{student.firstName}{" "}
            {student.lastName}
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
