import type { SerializeFrom } from "@remix-run/node";
import type { Navigation } from "@remix-run/router";
import type { action, loader } from "../index";

import { Form } from "@remix-run/react";

import {
  DateInput,
  Input,
  Radio,
  Select,
  SubmitFormButton,
} from "~/components";

interface Props {
  transition: Navigation;
  loaderData: SerializeFrom<typeof loader>;
  actionData: SerializeFrom<typeof action> | undefined;
}

export function StudentForm({
  transition,
  loaderData: { student },
  actionData,
}: Props) {
  return (
    <Form
      method="post"
      className="relative flex-1 overflow-y-auto border-primary md:mb-0 md:mr-8 md:border-r md:pr-4"
    >
      <fieldset disabled={transition.state === "submitting"}>
        <Input
          defaultValue={student?.firstName}
          label="First name"
          name="firstName"
          required
        />

        <Input
          defaultValue={student?.lastName}
          label="Last name"
          name="lastName"
          required
        />

        <Select
          label="Gender"
          name="gender"
          defaultValue={student?.gender}
          options={[
            { value: "", label: "Select a gender" },
            { value: "MALE", label: "Male" },
            { value: "FEMALE", label: "Female" },
          ]}
          required
        />

        <DateInput
          defaultValue={student?.dateOfBirth ?? ""}
          label="Date of birth"
          name="dateOfBirth"
        />

        <Input
          defaultValue={student?.address ?? undefined}
          label="Address"
          name="address"
        />

        <Radio
          label="Dietary requirements/allergies"
          name="allergies"
          defaultValue={student?.allergies?.toString()}
          options={[
            {
              label: "Yes",
              value: "true",
            },
            {
              label: "No",
              value: "false",
            },
          ]}
        />

        <Radio
          label="Approval to publish photographs?"
          name="hasApprovedToPublishPhotos"
          defaultValue={student?.hasApprovedToPublishPhotos?.toString()}
          options={[
            {
              label: "Yes",
              value: "true",
            },
            {
              label: "No",
              value: "false",
            },
          ]}
        />

        <Input
          defaultValue={student?.bestPersonToContact ?? undefined}
          label="Best person to contact"
          name="bestPersonToContact"
        />

        <Input
          defaultValue={student?.bestContactMethod ?? undefined}
          label="Best contact method"
          name="bestContactMethod"
        />

        <Input
          defaultValue={student?.schoolName ?? undefined}
          label="Name of the school"
          name="schoolName"
        />

        <Input
          defaultValue={student?.yearLevel ?? undefined}
          label="Year level"
          name="yearLevel"
        />

        <Input
          defaultValue={student?.emergencyContactFullName ?? undefined}
          label="Emergency contact full name"
          name="emergencyContactFullName"
        />

        <Input
          defaultValue={student?.emergencyContactRelationship ?? undefined}
          label="Emergency contact relationship"
          name="emergencyContactRelationship"
        />

        <Input
          defaultValue={student?.emergencyContactPhone ?? undefined}
          label="Emergency contact phone"
          name="emergencyContactPhone"
        />

        <Input
          defaultValue={student?.emergencyContactEmail ?? undefined}
          label="Emergency contact email"
          name="emergencyContactEmail"
        />

        <Input
          defaultValue={student?.emergencyContactAddress ?? undefined}
          label="Emergency contact address"
          name="emergencyContactAddress"
        />

        <DateInput
          defaultValue={student?.startDate ?? ""}
          label="Start date"
          name="startDate"
        />

        <SubmitFormButton
          sticky
          successMessage={actionData?.message}
          className="mt-4 justify-between"
        />
      </fieldset>
    </Form>
  );
}
