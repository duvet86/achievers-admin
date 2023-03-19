import type { LoaderArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import UserPlusIcon from "@heroicons/react/24/solid/UserPlusIcon";

import BackHeader from "~/components/BackHeader";
import SubTitle from "~/components/SubTitle";
import Text from "~/components/Text";
import Title from "~/components/Title";

import { getEOIUserByIdAsync } from "./services.server";

export async function loader({ params }: LoaderArgs) {
  invariant(params.eoiId, "eoiId not found");

  const eoiUser = await getEOIUserByIdAsync(Number(params.eoiId));

  return json({
    eoiUser,
  });
}

export default function Index() {
  const { eoiUser } = useLoaderData<typeof loader>();

  return (
    <>
      <BackHeader />

      <Title>
        Expression of interest: "{eoiUser.firstName} {eoiUser.lastName}"
      </Title>

      <div className="flex h-full flex-col overflow-y-scroll">
        <Text label="Email" text={eoiUser.email} />

        <Text label="First Name" text={eoiUser.firstName} />

        <Text label="Last Name" text={eoiUser.lastName} />

        <Text label="Mobile" text={eoiUser.mobile} />

        <Text label="Address" text={eoiUser.address} />

        <Text label="Best time to contact" text={eoiUser.bestTimeToContact} />

        <Text label="Occupation" text={eoiUser.occupation} />

        <Text
          label="Has any volunteer experience"
          text={eoiUser.volunteerExperience}
        />

        <Text label="Interested in role" text={eoiUser.interestedInRole} />

        <Text label="Mentoring level" text={eoiUser.mentoringLevel} />

        <Text label="Heared about us" text={eoiUser.hearAboutUs} />

        <Text label="Mentor or volunteer" text={eoiUser.mentorOrVolunteer} />

        <Text label="Preferred location" text={eoiUser.preferredLocation} />

        <Text label="Preferred frequency" text={eoiUser.preferredFrequency} />

        <Text label="Is over 18" text={eoiUser.isOver18 ? "Yes" : "No"} />

        <SubTitle>Referee 1</SubTitle>

        <Text label="Email" text={eoiUser.referee1Email} />

        <Text label="First name" text={eoiUser.referee1FirstName} />

        <Text label="Last name" text={eoiUser.referee1Surname} />

        <Text label="Mobile" text={eoiUser.referee1Mobile} />

        <Text
          label="Best time to contact"
          text={eoiUser.referee1BestTimeToContact}
        />

        <Text label="Relationship" text={eoiUser.referee1Relationship} />

        <SubTitle>Referee 2</SubTitle>

        <Text label="Email" text={eoiUser.referee2Email} />

        <Text label="First name" text={eoiUser.referee2FirstName} />

        <Text label="Last name" text={eoiUser.referee2Surname} />

        <Text label="Mobile" text={eoiUser.referee2Mobile} />

        <Text
          label="Best time to contact"
          text={eoiUser.referee2BestTimeToContact}
        />

        <Text label="Relationship" text={eoiUser.referee2Relationship} />

        <div className="sticky bottom-0 mt-6 w-full">
          <Link
            className="btn-primary btn float-right mr-2 w-40 gap-3"
            to="invite"
          >
            <UserPlusIcon className="h-6 w-6" />
            Invite
          </Link>
        </div>
      </div>
    </>
  );
}
