import type { SerializeFrom } from "@remix-run/node";
import type { loader } from "../route";

import { Form } from "@remix-run/react";

import {
  DateInput,
  Input,
  Radio,
  Select,
  SubmitFormButton,
} from "~/components";

interface Props {
  isLoading: boolean;
  loaderData: SerializeFrom<typeof loader>;
}

export function StudentForm({
  isLoading,
  loaderData: { student, chapters, yearLevelCalculated },
}: Props) {
  return (
    <Form
      method="post"
      className="relative flex-1 overflow-y-auto border-primary md:mb-0 md:mr-8 md:border-r md:pr-4"
    >
      <fieldset disabled={isLoading}>
        <Select
          name="chapterId"
          label="Chapter"
          defaultValue={student?.chapterId.toString()}
          options={[{ value: "", label: "Select a chapter" }].concat(
            chapters.map(({ id, name }) => ({
              label: name,
              value: id.toString(),
            })),
          )}
          required
        />

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
          defaultValue={student?.gender ?? ""}
          options={[
            { value: "", label: "Select a gender" },
            { value: "MALE", label: "Male" },
            { value: "FEMALE", label: "Female" },
          ]}
        />

        <DateInput
          defaultValue={student?.dateOfBirth ?? ""}
          label="Date of birth"
          name="dateOfBirth"
        />

        <Input
          type="number"
          min="1"
          max="12"
          defaultValue={
            student?.yearLevel?.toString() ?? yearLevelCalculated ?? ""
          }
          label={
            yearLevelCalculated == null
              ? "Year level"
              : "Year level (calculated from the DoB)"
          }
          name="yearLevel"
        />

        <Input
          defaultValue={student?.address ?? ""}
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

        <SubmitFormButton sticky className="mt-4 justify-between" />
      </fieldset>
    </Form>
  );
}
