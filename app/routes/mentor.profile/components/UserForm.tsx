import { Form, useNavigation } from "react-router";

import { DateInput, Input, Radio } from "~/components";

import { ProfileInput } from "./ProfileInput";

interface Props {
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    preferredName: string | null;
    fullName: string;
    mobile: string;
    addressStreet: string;
    addressSuburb: string;
    addressState: string;
    addressPostcode: string;
    additionalEmail: string | null;
    dateOfBirth: Date | null;
    emergencyContactName: string | null;
    emergencyContactNumber: string | null;
    emergencyContactAddress: string | null;
    emergencyContactRelationship: string | null;
    profilePicturePath: string | null;
    hasApprovedToPublishPhotos: boolean | null;
    volunteerAgreementSignedOn: Date | null;
    chapter: { id: number; name: string };
  };
}

export function UserForm({ user }: Props) {
  const transition = useNavigation();

  return (
    <Form method="post" encType="multipart/form-data">
      <fieldset
        className="fieldset"
        disabled={transition.state === "submitting"}
      >
        <ProfileInput
          defaultProfilePicturePath={user.profilePicturePath}
          userId={user.id}
          fullName={user.fullName}
        />

        <Input
          type="email"
          defaultValue={user.email}
          label="Email"
          name="email"
          disabled
          readOnly
        />

        <Input
          defaultValue={user.chapter.name}
          label="Chapter"
          name="chapter"
          disabled
          readOnly
        />

        <Input
          defaultValue={user.firstName}
          label="First name"
          name="firstName"
          disabled
          readOnly
        />

        <Input
          defaultValue={user.preferredName ?? "-"}
          label="Preferred name"
          name="preferredName"
          disabled
          readOnly
        />

        <Input
          defaultValue={user.lastName}
          label="Last name"
          name="lastName"
          disabled
          readOnly
        />

        <Input
          defaultValue={user.mobile}
          label="Mobile"
          name="mobile"
          disabled
          readOnly
        />

        <Input
          defaultValue={user.addressStreet}
          label="Address street"
          name="addressStreet"
          disabled
          readOnly
        />

        <Input
          defaultValue={user.addressSuburb}
          label="Address suburb"
          name="addressSuburb"
          disabled
          readOnly
        />

        <Input
          defaultValue={user.addressState}
          label="Address state"
          name="addressState"
          disabled
          readOnly
        />

        <Input
          defaultValue={user.addressPostcode}
          label="Address postcode"
          name="addressPostcode"
          disabled
          readOnly
        />

        <DateInput
          defaultValue={user.dateOfBirth ?? "-"}
          label="Date of birth"
          name="dateOfBirth"
          disabled
          readOnly
        />

        <Input
          defaultValue={user.emergencyContactName ?? "-"}
          label="Emergency contact name"
          name="emergencyContactName"
          disabled
          readOnly
        />

        <Input
          defaultValue={user.emergencyContactNumber ?? "-"}
          label="Emergency contact number"
          name="emergencyContactNumber"
          disabled
          readOnly
        />

        <Input
          defaultValue={user.emergencyContactAddress ?? "-"}
          label="Emergency contact address"
          name="emergencyContactAddress"
          disabled
          readOnly
        />

        <Input
          defaultValue={user.emergencyContactRelationship ?? "-"}
          label="Emergency contact relationship"
          name="emergencyContactRelationship"
          disabled
          readOnly
        />

        <Input
          type="email"
          defaultValue={user.additionalEmail ?? "-"}
          label="Additional email"
          name="additionalEmail"
          disabled
          readOnly
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
          disabled
          readOnly
        />
      </fieldset>
    </Form>
  );
}
