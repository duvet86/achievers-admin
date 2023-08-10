import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import type { ReferenceUpdateCommand } from "./services.server";

import { json } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import {
  BackHeader,
  Title,
  Input,
  DateInput,
  Textarea,
  Checkbox,
  SubmitFormButton,
  SubTitle,
} from "~/components";

import {
  getUserWithReferenceByIdAsync,
  updateReferenceByIdAsync,
} from "./services.server";

export async function loader({ params }: LoaderArgs) {
  invariant(params.userId, "userId not found");
  invariant(params.referenceId, "referenceId not found");

  const user = await getUserWithReferenceByIdAsync(
    Number(params.userId),
    Number(params.referenceId),
  );

  return json({
    user,
  });
}

export async function action({ request, params }: ActionArgs) {
  invariant(params.userId, "userId not found");
  invariant(params.referenceId, "referenceId not found");

  const formData = await request.formData();

  const firstName = formData.get("firstName")?.toString();
  const lastName = formData.get("lastName")?.toString();
  const mobile = formData.get("mobile")?.toString();
  const email = formData.get("email")?.toString();
  const bestTimeToContact = formData.get("bestTimeToContact")?.toString();
  const relationship = formData.get("relationship")?.toString();
  const hasKnowApplicantForAYear = formData
    .get("hasKnowApplicantForAYear")
    ?.toString();
  const isRelated = formData.get("isRelated")?.toString();
  const isMentorRecommended = formData.get("isMentorRecommended")?.toString();
  const calledBy = formData.get("calledBy")?.toString();
  const calledOndate = formData.get("calledOndate")?.toString();
  const outcomeComment = formData.get("outcomeComment")?.toString();
  const generalComment = formData.get("generalComment")?.toString() ?? null;

  if (
    firstName === undefined ||
    lastName === undefined ||
    mobile === undefined ||
    email === undefined ||
    bestTimeToContact === undefined ||
    relationship === undefined ||
    hasKnowApplicantForAYear === undefined ||
    isRelated === undefined ||
    isMentorRecommended === undefined ||
    calledBy === undefined ||
    calledOndate === undefined ||
    outcomeComment === undefined
  ) {
    return json<{
      message: string | null;
    }>({
      message: "Missing required fields",
    });
  }

  const data: ReferenceUpdateCommand = {
    bestTimeToContact,
    email,
    firstName,
    lastName,
    mobile,
    relationship,
    calledBy,
    calledOndate,
    generalComment,
    hasKnowApplicantForAYear: hasKnowApplicantForAYear === "true",
    isMentorRecommended: isMentorRecommended === "true",
    isRelated: isRelated === "true",
    outcomeComment,
  };

  await updateReferenceByIdAsync(
    Number(params.userId),
    Number(params.referenceId),
    data,
  );

  return json<{
    message: string | null;
  }>({
    message: null,
  });
}

export default function Index() {
  const transition = useNavigation();
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const reference = user.references[0];

  return (
    <>
      <BackHeader />

      <Title>
        Reference "{reference.firstName} {reference.lastName}" for mentor "
        {user.firstName} {user.lastName}"
      </Title>

      <Form className="relative" method="post">
        <fieldset disabled={transition.state === "submitting"}>
          <SubTitle>Details</SubTitle>

          <Input
            label="First name"
            name="firstName"
            defaultValue={reference.firstName ?? ""}
            required
          />

          <Input
            label="Last name"
            name="lastName"
            defaultValue={reference.lastName ?? ""}
            required
          />

          <Input
            label="Mobile"
            name="mobile"
            defaultValue={reference.mobile ?? ""}
            required
          />

          <Input
            label="Email"
            name="email"
            defaultValue={reference.email ?? ""}
            required
          />

          <Input
            label="Best time to contact"
            name="bestTimeToContact"
            defaultValue={reference.bestTimeToContact ?? ""}
            required
          />

          <Input
            label="Relationship"
            name="relationship"
            defaultValue={reference.relationship ?? ""}
            required
          />

          <SubTitle>Outcome</SubTitle>

          <Checkbox
            label="Has know the applicant for a year?"
            name="hasKnowApplicantForAYear"
            defaultChecked={reference.hasKnowApplicantForAYear ?? false}
          />

          <Checkbox
            label="Is related?"
            name="isRelated"
            defaultChecked={reference.isRelated ?? false}
          />

          <Checkbox
            label="Is mentor recommended?"
            name="isMentorRecommended"
            defaultChecked={reference.isMentorRecommended ?? false}
          />

          <Input
            label="Called by"
            name="calledBy"
            defaultValue={reference.calledBy ?? ""}
          />

          <DateInput
            defaultValue={reference.calledOndate ?? ""}
            label="Called on"
            name="calledOndate"
          />

          <Textarea
            label="Outcome comment"
            name="outcomeComment"
            defaultValue={reference.outcomeComment ?? ""}
          />

          <Textarea
            label="General comment"
            name="generalComment"
            defaultValue={reference.generalComment ?? ""}
          />

          <SubmitFormButton message={actionData?.message} sticky />
        </fieldset>
      </Form>
    </>
  );
}
