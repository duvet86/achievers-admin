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
        Volounteer agreement for "{user.firstName} {user.lastName}"
      </Title>

      <Text
        text={
          user.volunteerAgreement?.isInformedOfConstitution.toString() ?? "-"
        }
        label="Has acknowledged of been informed of the constitution?"
      />

      <Text
        text={
          user.volunteerAgreement?.hasApprovedSafetyDirections.toString() ?? "-"
        }
        label="Has acknowledged of safety directions?"
      />

      <Text
        text={user.volunteerAgreement?.hasAcceptedNoLegalResp.toString() ?? ""}
        label="Has acknowledged of no legal responsabilities from the club?"
      />

      <Text
        text={user.volunteerAgreement?.signedOn.toString() ?? "-"}
        label="Signed on"
      />
    </>
  );
}
