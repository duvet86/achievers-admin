import type { Prisma } from "~/prisma/client";
import type { XOR } from "~/models";
import type { Route } from "./+types/route";

import { Form } from "react-router";
import invariant from "tiny-invariant";

import { Input, SubmitFormButton, Title } from "~/components";

import { getTeacherByIdAsync, updateTeacherByIdAsync } from "./services.server";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.eoiId, "eoiId not found");
  invariant(params.teacherId, "teacherId not found");

  const teacher = await getTeacherByIdAsync(Number(params.teacherId));

  return {
    teacher,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.eoiId, "eoiId not found");
  invariant(params.teacherId, "teacherId not found");

  const formData = await request.formData();

  const fullName = formData.get("fullName")?.toString();
  const email = formData.get("email")?.toString();
  const schoolName = formData.get("schoolName")?.toString();

  const dataUpdate: XOR<
    Prisma.StudentTeacherUpdateInput,
    Prisma.StudentTeacherUncheckedUpdateInput
  > = {
    fullName,
    email,
    schoolName,
  };

  await updateTeacherByIdAsync(Number(params.teacherId), dataUpdate);

  return {
    message: "Successfully saved",
  };
}

export default function Index({
  loaderData: { teacher },
  actionData,
}: Route.ComponentProps) {
  return (
    <>
      <Title>
        Student EOI for &quot;{teacher.eoiStudentProfile?.fullName}&quot; - edit
        teacher
      </Title>

      <hr className="my-4" />

      <Form method="post">
        <fieldset className="fieldset">
          <Input
            defaultValue={teacher?.fullName}
            label="Full name"
            name="fullName"
            required
          />

          <Input
            defaultValue={teacher?.email}
            label="Email address"
            name="email"
            required
          />

          <Input
            defaultValue={teacher?.schoolName}
            label="Name of the school"
            name="schoolName"
            required
          />

          <SubmitFormButton
            successMessage={actionData?.message}
            className="mt-6 justify-between"
          />
        </fieldset>
      </Form>
    </>
  );
}
