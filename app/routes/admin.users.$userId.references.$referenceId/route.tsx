import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import type { ReferenceUpdateCommand } from "./services.server";

import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import invariant from "tiny-invariant";

import {
  Title,
  Input,
  DateInput,
  Textarea,
  SubmitFormButton,
  SubTitle,
  Radio,
} from "~/components";

import {
  getUserWithReferenceByIdAsync,
  updateReferenceByIdAsync,
} from "./services.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.userId, "userId not found");
  invariant(params.referenceId, "referenceId not found");

  const user = await getUserWithReferenceByIdAsync(
    Number(params.userId),
    Number(params.referenceId),
  );

  return {
    user,
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
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
  const knownForComment = formData.get("knownForComment")?.toString();
  const safeWithChildren = formData.get("safeWithChildren")?.toString();
  const skillAndKnowledgeComment = formData
    .get("skillAndKnowledgeComment")
    ?.toString();
  const empathyAndPatienceComment = formData
    .get("empathyAndPatienceComment")
    ?.toString();
  const buildRelationshipsComment = formData
    .get("buildRelationshipsComment")
    ?.toString();
  const outcomeComment = formData.get("outcomeComment")?.toString();
  const generalComment = formData.get("generalComment")?.toString() ?? null;
  const isMentorRecommended = formData.get("isMentorRecommended")?.toString();
  const calledBy = formData.get("calledBy")?.toString();
  const calledOndate = formData.get("calledOndate")?.toString();

  if (
    firstName === undefined ||
    lastName === undefined ||
    mobile === undefined ||
    email === undefined ||
    relationship === undefined ||
    hasKnowApplicantForAYear === undefined ||
    isRelated === undefined ||
    isMentorRecommended === undefined ||
    calledBy === undefined ||
    calledOndate === undefined ||
    outcomeComment === undefined
  ) {
    return {
      successMessage: null,
      errorMessage: "Missing required fields",
    };
  }

  const data: ReferenceUpdateCommand = {
    firstName,
    lastName,
    mobile,
    email,
    bestTimeToContact,
    relationship,
    hasKnowApplicantForAYear: hasKnowApplicantForAYear === "true",
    isRelated: isRelated === "true",
    knownForComment,
    safeWithChildren,
    skillAndKnowledgeComment,
    empathyAndPatienceComment,
    buildRelationshipsComment,
    outcomeComment,
    generalComment,
    isMentorRecommended: isMentorRecommended === "true",
    calledBy,
    calledOndate,
  };

  await updateReferenceByIdAsync(
    Number(params.userId),
    Number(params.referenceId),
    data,
  );

  return {
    successMessage: "Saved successfully",
    errorMessage: null,
  };
}

export default function Index() {
  const transition = useNavigation();
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const reference = user.references[0];

  return (
    <>
      <Title>
        Reference &quot;{reference.firstName} {reference.lastName}&quot; for
        mentor &quot;
        {user.firstName} {user.lastName}&quot;
      </Title>

      <Form className="relative" method="post">
        <fieldset
          className="fieldset"
          disabled={transition.state === "submitting"}
        >
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
            label="Relationship"
            name="relationship"
            defaultValue={reference.relationship ?? ""}
            required
          />

          <Input
            label="Best time to contact"
            name="bestTimeToContact"
            defaultValue={reference.bestTimeToContact ?? ""}
          />

          <SubTitle>Outcome</SubTitle>

          <Radio
            label="Has the referee known the applicant for at least one year?"
            name="hasKnowApplicantForAYear"
            defaultValue={reference.hasKnowApplicantForAYear?.toString()}
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
            label="Is the referee a family member or partner of the applicant?"
            name="isRelated"
            defaultValue={reference.isRelated?.toString()}
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
            label="Please describe how long and in what capacity you have known the Applicant? (Use this to also confirm employment status, dates and role of the applicant)"
            name="knownForComment"
            defaultValue={reference.knownForComment ?? ""}
            required
          />

          <Textarea
            label="Would you be happy with your own children, or children you know, to be mentored by the Applicant?"
            name="safeWithChildren"
            defaultValue={reference.safeWithChildren ?? ""}
            required
          />

          <Textarea
            label="What skills and knowledge do you think the Applicant has that will help them fulfil this mentoring role?"
            name="skillAndKnowledgeComment"
            defaultValue={reference.skillAndKnowledgeComment ?? ""}
            required
          />

          <Textarea
            label="Empathy and patience are key attributes for mentoring. Does the Applicant have these attributes? Provide examples."
            name="empathyAndPatienceComment"
            defaultValue={reference.empathyAndPatienceComment ?? ""}
            required
          />

          <Textarea
            label="Another key attribute for this role is the ability to build relationships, especially with children. Does the Applicant have this attribute? Provide examples."
            name="buildRelationshipsComment"
            defaultValue={reference.buildRelationshipsComment ?? ""}
            required
          />

          <Textarea
            label="Any other comments? (Use this response to provide any other relevant information that may be helpful)."
            name="outcomeComment"
            defaultValue={reference.outcomeComment ?? ""}
            required
          />

          <SubTitle>Reference check completed</SubTitle>

          <Input
            label="By (name)"
            name="calledBy"
            defaultValue={reference.calledBy ?? ""}
            required
          />

          <DateInput
            defaultValue={reference.calledOndate ?? ""}
            label="On (date)"
            name="calledOndate"
            required
          />

          <Textarea
            label="General comment"
            name="generalComment"
            defaultValue={reference.generalComment ?? ""}
          />

          <Radio
            label="Based on this reference check, do you recommend the Potential Mentor named above be accepted as a Mentor?"
            name="isMentorRecommended"
            defaultValue={reference.isMentorRecommended?.toString()}
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

          <SubmitFormButton
            successMessage={actionData?.successMessage}
            errorMessage={actionData?.errorMessage}
            sticky
            className="justify-between"
          />
        </fieldset>
      </Form>
    </>
  );
}
