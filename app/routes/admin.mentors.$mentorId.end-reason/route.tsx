import type { Route } from "./+types/route";

import { redirect } from "react-router";
import invariant from "tiny-invariant";
import dayjs from "dayjs";

import { isLoggedUserBlockedAsync, trackException } from "~/services/.server";
import { Textarea, Title } from "~/components";

import { getUserByIdAsync } from "./services.server";

export async function loader({ params, request }: Route.LoaderArgs) {
  invariant(params.mentorId, "mentorId not found");

  const isUserBlocked = await isLoggedUserBlockedAsync(request, "Restricted");
  if (isUserBlocked) {
    trackException(
      new Error(
        `Request url: ${request.url}. loggedUser has no Restricted permissions.`,
      ),
    );
    throw redirect("/403");
  }

  const user = await getUserByIdAsync(Number(params.mentorId));

  return {
    ...user,
    endDate: dayjs(user.endDate).format("DD/MM/YYYY"),
  };
}

export default function Index({
  loaderData: { fullName, endDate, mentorNotes },
}: Route.ComponentProps) {
  return (
    <>
      <Title>Archived Mentor</Title>

      <p className="mt-4">
        Mentor: <span className="font-bold">{fullName}</span>
      </p>

      <p className="mt-4">
        Archived on: <span className="font-bold">{endDate}</span>
      </p>

      <p className="my-4">Reason:</p>

      {mentorNotes.length > 0 && (
        <Textarea defaultValue={mentorNotes[0].note} readOnly disabled />
      )}
    </>
  );
}
