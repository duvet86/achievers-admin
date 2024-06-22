import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigation } from "@remix-run/react";

import invariant from "tiny-invariant";
import { BinFull, Xmark } from "iconoir-react";

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
      <Title>Archive &quot;{student.fullName}&quot;</Title>

      <Form method="post">
        <fieldset disabled={transition.state === "submitting"}>
          <p>
            Are you sure you want to archive &quot;{student.fullName}&quot;?
          </p>

          <div className="mt-6 flex items-center justify-end gap-6">
            <Link
              className="btn btn-neutral w-44"
              to={`/admin/students/${student.id}`}
            >
              <Xmark className="h-6 w-6" />
              Cancel
            </Link>

            <button className="btn btn-success w-44 gap-4" type="submit">
              <BinFull className="h-6 w-6" />
              Archive
            </button>
          </div>
        </fieldset>
      </Form>
    </>
  );
}
