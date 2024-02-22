import type { SerializeFrom } from "@remix-run/node";
import type { action, loader } from "../index";

import type { Navigation } from "@remix-run/router";

import { Form } from "@remix-run/react";

import {
  DateInput,
  Input,
  Radio,
  Select,
  SubmitFormButton,
} from "~/components";

import ProfilePicture from "./ProfilePicture";

interface Props {
  transition: Navigation;
  loaderData: SerializeFrom<typeof loader>;
  actionData: SerializeFrom<typeof action> | undefined;
}

export function UserForm({
  transition,
  loaderData: { user, chapters },
  actionData,
}: Props) {
  return (
    <Form
      method="post"
      className="relative mb-8 flex-1 overflow-y-auto border-primary md:mb-0 md:mr-8 md:border-r md:pr-4"
    >
      <fieldset disabled={transition.state === "submitting"}>
        <ProfilePicture
          profilePicturePath={user.profilePicturePath}
          fullName={`${user.firstName} ${user.lastName}`}
        />

        <Input
          type="email"
          defaultValue={user.email}
          label="Email"
          name="email"
          disabled
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
          defaultValue={user.firstName ?? ""}
          label="First name"
          name="firstName"
          required
        />

        <Input
          defaultValue={user.lastName ?? ""}
          label="Last name"
          name="lastName"
          required
        />

        <Input
          defaultValue={user.mobile ?? ""}
          type="number"
          label="Mobile"
          name="mobile"
          required
        />

        <Input
          defaultValue={user.addressStreet ?? ""}
          label="Address street"
          name="addressStreet"
          required
        />

        <Input
          defaultValue={user.addressSuburb ?? ""}
          label="Address suburb"
          name="addressSuburb"
          required
        />

        <Input
          defaultValue={user.addressState ?? ""}
          label="Address state"
          name="addressState"
          required
        />

        <Input
          defaultValue={user.addressPostcode ?? ""}
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
          successMessage={actionData?.successMessage}
          className="justify-between"
        />
      </fieldset>
    </Form>
  );
}
