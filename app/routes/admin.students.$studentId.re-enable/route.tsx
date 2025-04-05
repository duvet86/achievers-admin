import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import { redirect } from "react-router";
import { Form, useLoaderData, useNavigation } from "react-router";
import invariant from "tiny-invariant";
import { OnTag } from "iconoir-react";

import { Title } from "~/components";

import { getStudentByIdAsync, updateEndDateAsync } from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.studentId, "studentId not found");

  const student = await getStudentByIdAsync(Number(params.studentId));

  return {
    student,
  };
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
      <Title>Re enable &quot;{student.fullName}&quot;</Title>

      <Form method="post">
        <fieldset disabled={transition.state !== "idle"}>
          <p>
            Are you sure you want to re enable &quot;{student.fullName}
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
