import type { $Enums } from "~/prisma/client";

import { Form } from "react-router";
import { FloppyDiskArrowIn } from "iconoir-react";

import { DateInput, Input, Radio, Select } from "~/components";

import { ProfileInput } from "./ProfileInput";

interface Props {
  student: {
    profilePicturePath: string | null;
    fullName: string;
    chapterId: number;
    firstName: string;
    lastName: string;
    gender: $Enums.Gender | null;
    dateOfBirth: Date | null;
    yearLevel: number | null;
    address: string | null;
    allergies: boolean;
    hasApprovedToPublishPhotos: boolean;
    bestPersonToContact: string | null;
    bestContactMethod: string | null;
    schoolName: string | null;
    emergencyContactFullName: string | null;
    emergencyContactRelationship: string | null;
    emergencyContactPhone: string | null;
    emergencyContactEmail: string | null;
    emergencyContactAddress: string | null;
    startDate: Date | null;
  } | null;
  chapters: {
    id: number;
    name: string;
  }[];
  yearLevelCalculated: number | null;
}

export function StudentForm({ student, chapters, yearLevelCalculated }: Props) {
  return (
    <Form
      method="post"
      encType="multipart/form-data"
      className="border-primary relative flex-1 overflow-y-auto md:mr-8 md:mb-0 md:border-r md:pr-4"
    >
      <fieldset className="fieldset">
        <ProfileInput
          defaultValue={student?.profilePicturePath ?? null}
          fullName={student?.fullName ?? "New student"}
        />

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
            yearLevelCalculated === null
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

        <div className="sticky bottom-0 z-10 mt-4 flex justify-end">
          <button className="btn btn-primary w-48" type="submit">
            <FloppyDiskArrowIn />
            Save
          </button>
        </div>
      </fieldset>
    </Form>
  );
}
