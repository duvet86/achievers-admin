import type { Route } from "./+types/route";

import invariant from "tiny-invariant";
import { Form } from "react-router";
import { OnTag } from "iconoir-react";

import { Message, Title } from "~/components";

import {
  getStudentEOIByIdAsync,
  promoteStudentEOIByIdAsync,
} from "./services.server";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.eoiId, "eoiId not found");

  const eoiStudent = await getStudentEOIByIdAsync(Number(params.eoiId));

  return {
    eoiStudent,
  };
}

export async function action({ params }: Route.ActionArgs) {
  invariant(params.eoiId, "eoiId not found");

  await promoteStudentEOIByIdAsync(Number(params.eoiId));

  return {
    successMessage: "Student EOI updated successfully",
  };
}

export default function Index({
  loaderData: { eoiStudent },
  actionData,
}: Route.ComponentProps) {
  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row">
        <Title>Promote student &quot;{eoiStudent.fullName}&quot;</Title>

        <Message key={Date.now()} successMessage={actionData?.successMessage} />
      </div>

      <Form method="post">
        <fieldset>
          <p>
            Are you sure you want to promote &quot;{eoiStudent.fullName}
            &quot;?
          </p>

          <div className="mt-6 flex items-center justify-end">
            <button className="btn btn-success w-44 gap-4" type="submit">
              <OnTag className="h-6 w-6" />
              Promote
            </button>
          </div>
        </fieldset>
      </Form>
    </>
  );
}
