import type { Route } from "./+types/route";

import { Form, useNavigation } from "react-router";
import invariant from "tiny-invariant";
import { BinFull } from "iconoir-react";

import { Message, Title } from "~/components";

import { archiveStudentAsync, getStudentByIdAsync } from "./services.server";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.studentId, "studentId not found");

  const student = await getStudentByIdAsync(Number(params.studentId));

  return {
    student,
  };
}

export async function action({ params }: Route.ActionArgs) {
  invariant(params.studentId, "studentId not found");

  await archiveStudentAsync(Number(params.studentId));

  return {
    successMessage: "Student archived successfully",
  };
}

export default function Chapter({
  loaderData: { student },
  actionData,
}: Route.ComponentProps) {
  const transition = useNavigation();

  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row">
        <Title>Archive &quot;{student.fullName}&quot;</Title>

        <Message key={Date.now()} successMessage={actionData?.successMessage} />
      </div>

      <Form method="post">
        <fieldset disabled={transition.state === "submitting"}>
          <p>
            Are you sure you want to archive &quot;{student.fullName}&quot;?
          </p>

          <div className="mt-6 flex items-center justify-end">
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
