import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import type { EoiUpdateCommand } from "./services.server";

import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import invariant from "tiny-invariant";

import { Input, Radio, SubmitFormButton, Textarea, Title } from "~/components";

import { getUserByIdAsync, updateEoiByUserIdAsync } from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));

  return {
    user,
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.userId, "userId not found");

  const formData = await request.formData();

  const bestTimeToContact = formData.get("bestTimeToContact")?.toString();
  const occupation = formData.get("occupation")?.toString();
  const volunteerExperience = formData.get("volunteerExperience")?.toString();
  const role = formData.get("role")?.toString();
  const mentoringLevel = formData.get("mentoringLevel")?.toString();
  const heardAboutUs = formData.get("heardAboutUs")?.toString();
  const preferredFrequency = formData.get("preferredFrequency")?.toString();
  const preferredSubject = formData.get("preferredSubject")?.toString();
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
    preferredSubject === undefined ||
    isOver18 === undefined ||
    comment === undefined ||
    aboutMe === undefined
  ) {
    return {
      successMessage: null,
      errorMessage: "Missing required fields",
    };
  }

  const data: EoiUpdateCommand = {
    bestTimeToContact,
    occupation,
    volunteerExperience,
    role,
    mentoringLevel,
    heardAboutUs,
    preferredFrequency,
    preferredSubject,
    isOver18: isOver18 === "true",
    comment,
    aboutMe,
  };

  await updateEoiByUserIdAsync(Number(params.userId), data);

  return {
    successMessage: "Saved successfully",
    errorMessage: null,
  };
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const transition = useNavigation();

  const eoIProfile = user.eoIProfile;

  return (
    <>
      <Title>Expression of interest for &quot;{user.fullName}&quot;</Title>

      <hr className="my-4" />

      <Form method="post">
        <fieldset
          className="fieldset"
          disabled={transition.state === "submitting"}
        >
          <Textarea
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

          <Textarea
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

          <Input
            defaultValue={eoIProfile?.preferredSubject ?? ""}
            label="Preferred subject"
            name="preferredSubject"
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

          <Textarea
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

          <SubmitFormButton
            successMessage={actionData?.successMessage}
            errorMessage={actionData?.errorMessage}
            className="mt-6 justify-between"
          />
        </fieldset>
      </Form>
    </>
  );
}
