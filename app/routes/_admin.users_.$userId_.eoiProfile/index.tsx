import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import type { EoiUpdateCommand } from "./services.server";

import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import {
  BackHeader,
  Input,
  Radio,
  SubmitFormButton,
  Title,
} from "~/components";

import { getUserByIdAsync, updateEoiByUserIdAsync } from "./services.server";

export async function loader({ params }: LoaderArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));

  return json({
    user,
  });
}

export async function action({ request, params }: ActionArgs) {
  invariant(params.userId, "userId not found");

  const formData = await request.formData();

  const bestTimeToContact = formData.get("bestTimeToContact")?.toString();
  const occupation = formData.get("occupation")?.toString();
  const volunteerExperience = formData.get("volunteerExperience")?.toString();
  const role = formData.get("role")?.toString();
  const mentoringLevel = formData.get("mentoringLevel")?.toString();
  const heardAboutUs = formData.get("heardAboutUs")?.toString();
  const preferredFrequency = formData.get("preferredFrequency")?.toString();
  const isOver18 = formData.get("isOver18")?.toString();
  const comment = formData.get("comment")?.toString();
  const aboutMe = formData.get("aboutMe")?.toString();

  if (
    bestTimeToContact === undefined ||
    occupation === undefined ||
    volunteerExperience === undefined ||
    role === undefined ||
    mentoringLevel === undefined ||
    heardAboutUs === undefined ||
    preferredFrequency === undefined ||
    isOver18 === undefined ||
    comment === undefined ||
    aboutMe === undefined
  ) {
    return json({
      successMessage: null,
      errorMessage: "Missing required fields",
    });
  }

  const data: EoiUpdateCommand = {
    bestTimeToContact,
    occupation,
    volunteerExperience,
    role,
    mentoringLevel,
    heardAboutUs,
    preferredFrequency,
    isOver18: isOver18 === "true",
    comment,
    aboutMe,
  };

  await updateEoiByUserIdAsync(Number(params.userId), data);

  return json({
    successMessage: "Saved successfully",
    errorMessage: null,
  });
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>();

  const eoIProfile = user.eoIProfile;

  return (
    <>
      <BackHeader />

      <Title>
        Expression of interest for "{user.firstName} {user.lastName}"
      </Title>

      <Form method="post">
        <Input
          defaultValue={eoIProfile?.bestTimeToContact ?? ""}
          label="Best time to contact"
          name="bestTimeToContact"
          required
        />

        <Input
          defaultValue={eoIProfile?.occupation ?? ""}
          label="Occupation"
          name="occupation"
          required
        />

        <Input
          defaultValue={eoIProfile?.volunteerExperience ?? ""}
          label="Volunteer experience"
          name="volunteerExperience"
          required
        />

        <Input
          defaultValue={eoIProfile?.role ?? ""}
          label="Role"
          name="role"
          required
        />

        <Input
          defaultValue={eoIProfile?.mentoringLevel ?? ""}
          label="Mentoring level"
          name="mentoringLevel"
          required
        />

        <Input
          defaultValue={eoIProfile?.heardAboutUs ?? ""}
          label="How did you hear about us?"
          name="heardAboutUs"
          required
        />

        <Input
          defaultValue={eoIProfile?.preferredFrequency ?? ""}
          label="Preferred frequency"
          name="preferredFrequency"
          required
        />

        <Radio
          label="Is over 18?"
          name="isOver18"
          defaultValue={eoIProfile?.isOver18.toString()}
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
          defaultValue={eoIProfile?.comment ?? ""}
          label="Why a volunteer?"
          name="comment"
          required
        />

        <Input
          defaultValue={eoIProfile?.aboutMe ?? ""}
          label="About me"
          name="aboutMe"
          required
        />

        <SubmitFormButton />
      </Form>
    </>
  );
}
