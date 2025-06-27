import { Form, useNavigation } from "react-router";

import {
  DateInput,
  Input,
  Radio,
  Select,
  SubmitFormButton,
} from "~/components";

import { ProfileInput } from "~/components";

interface Props {
  user: {
    profilePicturePath: string | null;
    fullName: string;
    email: string;
    azureADId: string | null;
    chapterId: number;
    firstName: string;
    lastName: string;
    preferredName: string | null;
    mobile: string;
    addressStreet: string;
    addressSuburb: string;
    addressState: string;
    addressPostcode: string;
    dateOfBirth: Date | null;
    emergencyContactName: string | null;
    emergencyContactNumber: string | null;
    emergencyContactAddress: string | null;
    emergencyContactRelationship: string | null;
    additionalEmail: string | null;
    hasApprovedToPublishPhotos: boolean | null;
  };
  chapters: {
    id: number;
    name: string;
  }[];
  successMessage: string | undefined;
}

export function UserForm({ user, chapters, successMessage }: Props) {
  const transition = useNavigation();

  return (
    <Form
      method="post"
      encType="multipart/form-data"
      className="border-primary relative mb-8 flex-1 overflow-y-auto md:mr-8 md:mb-0 md:border-r md:pr-4"
    >
      <fieldset
        className="fieldset"
        disabled={transition.state === "submitting"}
      >
        <ProfileInput
          defaultValue={user.profilePicturePath}
          fullName={`${user.fullName}`}
        />

        <Input
          type="email"
          defaultValue={user.email}
          label="Email"
          name="email"
          disabled={user.azureADId !== null}
        />

        <Select
          name="chapterId"
          label="Chapter"
          defaultValue={user.chapterId.toString()}
          required
          options={[{ value: "", label: "Select a chapter" }].concat(
            chapters.map(({ id, name }) => ({
              label: name,
              value: id.toString(),
            })),
          )}
        />

        <Input
          defaultValue={user.firstName}
          label="First name"
          name="firstName"
          required
        />

        <Input
          defaultValue={user.preferredName ?? ""}
          label="Preferred name"
          name="preferredName"
        />

        <Input
          defaultValue={user.lastName}
          label="Last name"
          name="lastName"
          required
        />

        <Input
          defaultValue={user.mobile}
          label="Mobile"
          name="mobile"
          required
        />

        <Input
          defaultValue={user.addressStreet}
          label="Address street"
          name="addressStreet"
          required
        />

        <Input
          defaultValue={user.addressSuburb}
          label="Address suburb"
          name="addressSuburb"
          required
        />

        <Input
          defaultValue={user.addressState}
          label="Address state"
          name="addressState"
          required
        />

        <Input
          defaultValue={user.addressPostcode}
          label="Address postcode"
          name="addressPostcode"
          required
        />

        <DateInput
          defaultValue={user.dateOfBirth ?? ""}
          label="Date of birth"
          name="dateOfBirth"
        />

        <Input
          defaultValue={user.emergencyContactName ?? ""}
          label="Emergency contact name"
          name="emergencyContactName"
        />

        <Input
          defaultValue={user.emergencyContactNumber ?? ""}
          label="Emergency contact number"
          name="emergencyContactNumber"
        />

        <Input
          defaultValue={user.emergencyContactAddress ?? ""}
          label="Emergency contact address"
          name="emergencyContactAddress"
        />

        <Input
          defaultValue={user.emergencyContactRelationship ?? ""}
          label="Emergency contact relationship"
          name="emergencyContactRelationship"
        />

        <Input
          type="email"
          defaultValue={user.additionalEmail ?? ""}
          label="Additional email"
          name="additionalEmail"
        />

        <Radio
          label="Permission to publish photos?"
          name="hasApprovedToPublishPhotos"
          defaultValue={user.hasApprovedToPublishPhotos?.toString()}
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

        <SubmitFormButton
          sticky
          successMessage={successMessage}
          className="justify-between"
        />
      </fieldset>
    </Form>
  );
}
