import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";

import invariant from "tiny-invariant";
import { BinFull } from "iconoir-react";

import { Title } from "~/components";

import { archiveStudentAsync, getStudentByIdAsync } from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.studentId, "studentId not found");

  const student = await getStudentByIdAsync(Number(params.studentId));

  return json({
    student,
  });
}

export async function action({ params }: ActionFunctionArgs) {
  invariant(params.studentId, "studentId not found");

  await archiveStudentAsync(Number(params.studentId));

  return redirect("/admin/students");
}

export default function Chapter() {
  const { student } = useLoaderData<typeof loader>();
  const transition = useNavigation();

  return (
    <>
      <Title>
        Archive &quot;{student.firstName} {student.lastName}&quot;
      </Title>

      <Form method="post">
        <fieldset disabled={transition.state === "submitting"}>
          <p>
            Are you sure you want to archive &quot;{student.firstName}{" "}
            {student.lastName}&quot;?
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
