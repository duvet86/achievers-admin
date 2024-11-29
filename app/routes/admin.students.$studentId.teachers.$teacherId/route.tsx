import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import type { Prisma } from "@prisma/client";

import { data, Form, useActionData, useLoaderData, useNavigation, useParams } from "react-router";
import invariant from "tiny-invariant";

import { Input, SubmitFormButton, Title } from "~/components";

import {
  createTeacherAsync,
  getTeacherByIdAsync,
  updateTeacherByIdAsync,
} from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.studentId, "studentId not found");
  invariant(params.teacherId, "teacherId not found");

  if (params.teacherId === "new") {
    return {
      studentId: params.studentId,
      teacher: null,
    };
  } else {
    const teacher = await getTeacherByIdAsync(Number(params.teacherId));
    if (teacher === null) {
      throw data("Not Found", {
        status: 404,
      });
    }

    return {
      studentId: params.studentId,
      teacher,
    };
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.studentId, "studentId not found");
  invariant(params.teacherId, "teacherId not found");

  const formData = await request.formData();

  const fullName = formData.get("fullName")?.toString();
  const email = formData.get("email")?.toString();
  const schoolName = formData.get("schoolName")?.toString();

  if (params.teacherId === "new") {
    if (!fullName || !email || !schoolName) {
      throw new Error();
    }

    const dataCreate: Prisma.XOR<
      Prisma.StudentTeacherCreateInput,
      Prisma.StudentTeacherUncheckedCreateInput
    > = {
      fullName,
      email,
      schoolName,
      studentId: Number(params.studentId),
    };

    await createTeacherAsync(dataCreate);
  } else {
    const dataUpdate: Prisma.XOR<
      Prisma.StudentTeacherUpdateInput,
      Prisma.StudentTeacherUncheckedUpdateInput
    > = {
      fullName,
      email,
      schoolName,
    };
    await updateTeacherByIdAsync(Number(params.teacherId), dataUpdate);
  }

  return {
    message: "Successfully saved",
  };
}

export default function Index() {
  const { studentId, teacher } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const transition = useNavigation();
  const { teacherId } = useParams();

  return (
    <>
      <Title to={`/admin/students/${studentId}`}>
        {teacherId === "new" ? "Add new teacher" : "Edit info for teacher"}
      </Title>

      <Form method="post">
        <fieldset disabled={transition.state !== "idle"}>
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
