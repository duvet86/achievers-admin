import type { Route } from "./+types/route";

import { Form } from "react-router";
import invariant from "tiny-invariant";
import { OnTag } from "iconoir-react";

import { Message, Title } from "~/components";

import { getStudentByIdAsync, updateEndDateAsync } from "./services.server";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.studentId, "studentId not found");

  const student = await getStudentByIdAsync(Number(params.studentId));

  return {
    student,
  };
}

export async function action({ params }: Route.ActionArgs) {
  invariant(params.studentId, "studentId not found");

  await updateEndDateAsync(Number(params.studentId));

  return {
    successMessage: "Student re enabled successfully",
  };
}

export default function Index({
  loaderData: { student },
  actionData,
}: Route.ComponentProps) {
  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row">
        <Title>Re enable &quot;{student.fullName}&quot;</Title>

        <Message key={Date.now()} successMessage={actionData?.successMessage} />
      </div>

      <Form method="post">
        <fieldset>
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
