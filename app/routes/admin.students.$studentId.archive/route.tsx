import type { Route } from "./+types/route";

import { Form, redirect } from "react-router";
import invariant from "tiny-invariant";
import { BinFull } from "iconoir-react";

import { Textarea, Title } from "~/components";

import { archiveStudentAsync, getStudentByIdAsync } from "./services.server";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.studentId, "studentId not found");

  const student = await getStudentByIdAsync(Number(params.studentId));

  return {
    student,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.studentId, "studentId not found");

  const formData = await request.formData();
  const endReason = formData.get("endReason")?.toString();

  await archiveStudentAsync(Number(params.studentId), endReason!);

  return redirect(`/admin/students/${params.studentId}/end-reason`);
}

export default function Chapter({
  loaderData: { student },
}: Route.ComponentProps) {
  return (
    <>
      <Title>Archive &quot;{student.fullName}&quot;</Title>

      <Form method="post">
        <fieldset>
          <p>
            Are you sure you want to archive &quot;{student.fullName}&quot;?
          </p>

          <Textarea placeholder="Reason to Archive" name="endReason" required />

          <div className="mt-6 flex items-center justify-end">
            <button className="btn btn-success w-44 gap-4" type="submit">
              <BinFull />
              Archive
            </button>
          </div>
        </fieldset>
      </Form>
    </>
  );
}
