import type { SerializeFrom } from "@remix-run/node";
import type { Navigation } from "@remix-run/router";
import type { loader } from "../index";

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
}

export function StudentForm({ transition, loaderData: { student } }: Props) {
  return (
    <Form
      method="post"
      className="relative flex-1 overflow-y-auto border-primary md:mb-0 md:mr-8 md:border-r md:pr-4"
    >
      <fieldset disabled={transition.state === "submitting"}>
        <Input
          defaultValue={student.firstName}
          label="First name"
          name="firstName"
          required
        />

        <Input
          defaultValue={student.lastName}
          label="Last name"
          name="lastName"
          required
        />

        <DateInput
          defaultValue={student.dateOfBirth ?? ""}
          label="Date of birth"
          name="dateOfBirth"
          required
        />

        <Select
          label="Gender"
          name="gender"
          defaultValue={student.gender}
          options={[
            { value: "", label: "Select a gender" },
            { value: "MALE", label: "Male" },
            { value: "FEMALE", label: "Female" },
          ]}
          required
        />

        <Input
          defaultValue={student.address}
          label="Address"
          name="address"
          required
        />

        <Radio
          label="Dietary requirements/allergies"
          name="allergies"
          defaultValue={student.allergies?.toString()}
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
          required
        />

        <Radio
          label="Approval to publish photographs?"
          name="hasApprovedToPublishPhotos"
          defaultValue={student.hasApprovedToPublishPhotos?.toString()}
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
          required
        />

        <Input
          defaultValue={student.bestPersonToContact}
          label="Best person to contact"
          name="bestPersonToContact"
          required
        />

        <Input
          defaultValue={student.bestContactMethod}
          label="Best contact method"
          name="bestContactMethod"
          required
        />

        <Input
          defaultValue={student.schoolName}
          label="Name of the school"
          name="schoolName"
          required
        />

        <Input
          defaultValue={student.yearLevel}
          label="Year level"
          name="yearLevel"
          required
        />

        <Input
          defaultValue={student.emergencyContactFullName}
          label="Emergency contact full name"
          name="emergencyContactFullName"
          required
        />

        <Input
          defaultValue={student.emergencyContactRelationship}
          label="Emergency contact relationship"
          name="emergencyContactRelationship"
          required
        />

        <Input
          defaultValue={student.emergencyContactPhone}
          label="Emergency contact phone"
          name="emergencyContactPhone"
          required
        />

        <Input
          defaultValue={student.emergencyContactEmail}
          label="Emergency contact email"
          name="emergencyContactEmail"
          required
        />

        <Input
          defaultValue={student.emergencyContactAddress}
          label="Emergency contact address"
          name="emergencyContactAddress"
          required
        />

        <DateInput
          defaultValue={student.startDate ?? ""}
          label="Start date"
          name="startDate"
          required
        />

        <SubmitFormButton sticky />
      </fieldset>
    </Form>
  );
}
