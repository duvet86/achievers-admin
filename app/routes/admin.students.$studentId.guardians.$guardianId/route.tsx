import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import type { Prisma } from "@prisma/client";

import {
  data,
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useParams,
} from "react-router";
import invariant from "tiny-invariant";

import { Input, SubmitFormButton, Title } from "~/components";

import {
  createGuardianAsync,
  getGuardianByIdAsync,
  updateGuardianByIdAsync,
} from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.studentId, "studentId not found");
  invariant(params.guardianId, "guardianId not found");

  if (params.guardianId === "new") {
    return {
      studentId: params.studentId,
      guardian: null,
    };
  } else {
    const guardian = await getGuardianByIdAsync(Number(params.guardianId));
    if (guardian === null) {
      throw data("Not Found", {
        status: 404,
      });
    }

    return {
      studentId: params.studentId,
      guardian,
    };
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.studentId, "studentId not found");
  invariant(params.guardianId, "guardianId not found");

  const formData = await request.formData();

  const fullName = formData.get("fullName")?.toString();
  const relationship = formData.get("relationship")?.toString();
  const phone = formData.get("phone")?.toString();
  const email = formData.get("email")?.toString();
  const address = formData.get("address")?.toString();

  if (params.guardianId === "new") {
    if (!fullName || !relationship || !phone || !email || !address) {
      throw new Error();
    }

    const dataCreate: Prisma.XOR<
      Prisma.StudentGuardianCreateInput,
      Prisma.StudentGuardianUncheckedCreateInput
    > = {
      fullName,
      relationship,
      phone,
      email,
      address,
      studentId: Number(params.studentId),
    };

    await createGuardianAsync(dataCreate);
  } else {
    const dataUpdate: Prisma.XOR<
      Prisma.StudentGuardianUpdateInput,
      Prisma.StudentGuardianUncheckedUpdateInput
    > = {
      fullName,
      relationship,
      phone,
      email,
      address,
    };
    await updateGuardianByIdAsync(Number(params.guardianId), dataUpdate);
  }

  return {
    message: "Successfully saved",
  };
}

export default function Index() {
  const { studentId, guardian } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const transition = useNavigation();
  const { guardianId } = useParams();

  return (
    <>
      <Title to={`/admin/students/${studentId}`}>
        {guardianId === "new" ? "Add new guardian" : "Edit info for guardian"}
      </Title>

      <Form method="post">
        <fieldset disabled={transition.state !== "idle"}>
          <Input
            defaultValue={guardian?.fullName}
            label="Full name"
            name="fullName"
            required
          />

          <Input
            defaultValue={guardian?.relationship}
            label="Relationship"
            name="relationship"
            required
          />

          <Input
            defaultValue={guardian?.phone}
            label="Phone number"
            name="phone"
            required
          />

          <Input
            defaultValue={guardian?.email}
            label="Email address"
            name="email"
            required
          />

          <Input
            defaultValue={guardian?.address}
            label="Address"
            name="address"
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
