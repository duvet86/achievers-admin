import type { LoaderArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import BackHeader from "~/components/BackHeader";
import Text from "~/components/Text";
import Title from "~/components/Title";

import { getUserByIdAsync } from "./services.server";

export async function loader({ params }: LoaderArgs) {
  invariant(params.userId, "userId not found");

  const user = await getUserByIdAsync(Number(params.userId));

  return json({
    user,
  });
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <>
      <BackHeader />

      <Title>
        Expression of Interest for "{user.firstName} {user.lastName}"
      </Title>

      <Text
        text={user.eoIProfile?.bestTimeToContact ?? "-"}
        label="Best time to contact"
      />

      <Text text={user.eoIProfile?.occupation ?? "-"} label="Occupation" />

      <Text
        text={user.eoIProfile?.volunteerExperience ?? ""}
        label="Volunteer experience"
      />

      <Text text={user.eoIProfile?.role ?? "-"} label="Role" />

      <Text
        text={user.eoIProfile?.mentoringLevel ?? "-"}
        label="Mentoring level"
      />

      <Text
        text={user.eoIProfile?.heardAboutUs ?? "-"}
        label="How did you hear about us?"
      />

      <Text
        text={user.eoIProfile?.preferredFrequency ?? "-"}
        label="Preferred frequency"
      />

      <Text
        text={
          user.eoIProfile?.isOver18 === undefined
            ? "-"
            : user.eoIProfile.isOver18.toString()
        }
        label="Is over 18?"
      />

      <Text text={user.eoIProfile?.comment ?? "-"} label="Why a volounteer?" />

      <Text text={user.eoIProfile?.aboutMe ?? "-"} label="About me" />
    </>
  );
}
