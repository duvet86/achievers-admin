import type { Prisma } from "~/prisma/client";
import type { XOR } from "~/models";
import type { Route } from "./+types/route";

import { Form } from "react-router";
import invariant from "tiny-invariant";

import { Input, SubmitFormButton, Title } from "~/components";

import {
  getGuardianByIdAsync,
  updateGuardianByIdAsync,
} from "./services.server";

export async function loader({ params }: Route.LoaderArgs) {
  invariant(params.eoiId, "eoiId not found");
  invariant(params.guardianId, "guardianId not found");

  const guardian = await getGuardianByIdAsync(Number(params.guardianId));

  return {
    guardian,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  invariant(params.eoiId, "eoiId not found");
  invariant(params.guardianId, "guardianId not found");

  const formData = await request.formData();

  const fullName = formData.get("fullName")?.toString();
  const relationship = formData.get("relationship")?.toString();
  const phone = formData.get("phone")?.toString();
  const email = formData.get("email")?.toString();
  const address = formData.get("address")?.toString();

  const dataUpdate: XOR<
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

  return {
    message: "Successfully saved",
  };
}

export default function Index({
  loaderData: { guardian },
  actionData,
}: Route.ComponentProps) {
  return (
    <>
      <Title>
        Student EOI for &quot;{guardian.eoiStudentProfile?.fullName}&quot; -
        edit guardian
      </Title>

      <hr className="my-4" />

      <Form method="post">
        <fieldset className="fieldset">
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
