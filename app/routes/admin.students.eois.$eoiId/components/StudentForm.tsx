import { Form } from "react-router";

import {
  Checkbox,
  DateInput,
  Input,
  Select,
  SubmitFormButton,
} from "~/components";

interface Props {
  eoiStudent: {
    id: number;
    chapterId: number;
    firstName: string;
    lastName: string;
    gender: string;
    dateOfBirth: Date;
    email: string | null;
    yearLevel: string;
    address: string;
    dietaryRequirements: string;
    hasApprovedToPublishPhotos: boolean;
    bestPersonToContact: string;
    preferredName: string | null;
    mobile: string | null;
    isEnglishMainLanguage: boolean;
    otherLanguagesSpoken: string;
    bestPersonToContactForEmergency: string;
    favouriteSchoolSubject: string;
    leastFavouriteSchoolSubject: string;
    supportReason: string;
    otherSupport: string;
    alreadyInAchievers: string;
    heardAboutUs: string;
    weeklyCommitment: boolean;
    chapter: { id: number; name: string };
  };
  chapters: {
    id: number;
    name: string;
  }[];
}

export function StudentForm({ eoiStudent, chapters }: Props) {
  return (
    <Form
      method="post"
      className="border-primary relative flex-1 overflow-y-auto md:mr-8 md:mb-0 md:border-r md:pr-4"
    >
      <fieldset className="fieldset">
        <Select
          name="chapterId"
          label="Chapter"
          defaultValue={eoiStudent.chapterId.toString()}
          options={[{ value: "", label: "Select a chapter" }].concat(
            chapters.map(({ id, name }) => ({
              label: name,
              value: id.toString(),
            })),
          )}
          required
        />

        <Input
          defaultValue={eoiStudent.firstName}
          label="First name"
          name="firstName"
          required
        />

        <Input
          defaultValue={eoiStudent.preferredName ?? ""}
          label="Preferred Name"
          name="preferredName"
        />

        <Input
          defaultValue={eoiStudent.lastName}
          label="Last name"
          name="lastName"
          required
        />

        <Input
          type="email"
          defaultValue={eoiStudent.email ?? ""}
          label="Email"
          name="email"
        />

        <Input
          defaultValue={eoiStudent.mobile ?? ""}
          label="Mobile"
          name="mobile"
        />

        <Input
          defaultValue={eoiStudent.gender}
          label="Gender"
          name="gender"
          required
        />

        <DateInput
          defaultValue={eoiStudent.dateOfBirth}
          label="Date of birth"
          name="dateOfBirth"
          required
        />

        <Input
          defaultValue={eoiStudent.yearLevel}
          label="Year level"
          name="yearLevel"
          required
        />

        <Input
          defaultValue={eoiStudent.address}
          label="Address"
          name="address"
          required
        />

        <Input
          defaultValue={eoiStudent.dietaryRequirements}
          label="Dietary Requirements"
          name="dietaryRequirements"
          required
        />

        <Input
          defaultValue={eoiStudent.otherLanguagesSpoken}
          label="Other Languages Spoken"
          name="otherLanguagesSpoken"
          required
        />

        <Input
          defaultValue={eoiStudent.bestPersonToContact}
          label="Best Person To Contact"
          name="bestPersonToContact"
          required
        />

        <Input
          defaultValue={eoiStudent.bestPersonToContactForEmergency}
          label="Best Person To Contact For Emergency"
          name="bestPersonToContactForEmergency"
          required
        />

        <Input
          defaultValue={eoiStudent.favouriteSchoolSubject}
          label="Favourite School Subject"
          name="favouriteSchoolSubject"
          required
        />

        <Input
          defaultValue={eoiStudent.leastFavouriteSchoolSubject}
          label="Least Favourite School Subject"
          name="leastFavouriteSchoolSubject"
          required
        />

        <Input
          defaultValue={eoiStudent.supportReason}
          label="Reason for Support"
          name="supportReason"
          required
        />

        <Input
          defaultValue={eoiStudent.otherSupport}
          label="Other Support"
          name="otherSupport"
          required
        />

        <Input
          defaultValue={eoiStudent.alreadyInAchievers}
          label="Already In Achievers"
          name="alreadyInAchievers"
          required
        />

        <Input
          defaultValue={eoiStudent.heardAboutUs}
          label="Heard About Us"
          name="heardAboutUs"
          required
        />

        <Checkbox
          name="hasApprovedToPublishPhotos"
          label="Has Approved To Publish Photos?"
          defaultChecked={eoiStudent.hasApprovedToPublishPhotos}
          required
        />

        <Checkbox
          name="isEnglishMainLanguage"
          label="Is English the Main Language?"
          defaultChecked={eoiStudent.isEnglishMainLanguage}
          required
        />

        <Checkbox
          name="weeklyCommitment"
          label="Is Weekly Committed?"
          defaultChecked={eoiStudent.weeklyCommitment}
          required
        />

        <SubmitFormButton sticky className="mt-4 justify-between" />
      </fieldset>
    </Form>
  );
}
