import type { LoaderArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import ServerIcon from "@heroicons/react/24/solid/ServerIcon";

import BackHeader from "~/components/BackHeader";
import Title from "~/components/Title";
import Input from "~/components/Input";
import DateInput from "~/components/DateInput";
import Textarea from "~/components/Textarea";

import { getUserWithReferenceByIdAsync } from "./services.server";
import Checkbox from "~/components/Checkbox";

export async function loader({ params }: LoaderArgs) {
  invariant(params.userId, "userId not found");
  invariant(params.referenceId, "referenceId not found");

  const user = await getUserWithReferenceByIdAsync(
    Number(params.userId),
    Number(params.referenceId)
  );

  return json({
    user,
  });
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>();

  const reference = user.references[0];

  return (
    <>
      <BackHeader />

      <Title>
        Reference "{reference.firstName} {reference.lastName}" for mentor "
        {user.firstName} {user.lastName}"
      </Title>

      <Form>
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

        <Checkbox
          label="Has know the applicant for a year?"
          name="hasKnowApplicantForAYear"
          defaultChecked={reference.hasKnowApplicantForAYear ?? false}
          required
        />

        <Checkbox
          label="Is related?"
          name="isRelated"
          defaultChecked={reference.isRelated ?? false}
          required
        />

        <Checkbox
          label="Is mentor recommended?"
          name="isMentorRecommended"
          defaultChecked={reference.isMentorRecommended ?? false}
          required
        />

        <Input
          label="Called by"
          name="calledBy"
          defaultValue={reference.calledBy ?? ""}
          required
        />

        <DateInput
          defaultValue={reference.calledOndate ?? ""}
          label="Called on"
          name="calledOndate"
          required
        />

        <Textarea
          label="Outcome comment"
          name="outcomeComment"
          defaultValue={reference.outcomeComment ?? ""}
          required
        />

        <Textarea
          label="General comment"
          name="generalComment"
          defaultValue={reference.generalComment ?? ""}
        />

        <button
          className="btn-primary btn float-right mt-6 w-52 gap-4"
          type="submit"
        >
          <ServerIcon className="h-6 w-6" />
          Save
        </button>
      </Form>
    </>
  );
}
