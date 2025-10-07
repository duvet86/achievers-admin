import type { Route } from "./+types/layout";

import { Outlet, redirect } from "react-router";

import { getEnvironment } from "~/services";
import {
  getLoggedUserInfoAsync,
  getUserProfilePictureUrl,
  trackException,
  version,
} from "~/services/.server";
import { Body } from "~/components";

import { getUserByAzureADIdAsync } from "./services.server";

export async function loader({ request }: Route.LoaderArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);

  if (!loggedUser.isMentor) {
    trackException(
      new Error(
        `Request url: ${request.url}. loggedUser is not MENTOR: ${JSON.stringify(loggedUser)}`,
      ),
    );
    throw redirect("/403");
  }

  const user = await getUserByAzureADIdAsync(loggedUser.oid);
  if (user === null) {
    throw redirect("/403");
  }
  if (user.volunteerAgreementSignedOn === null) {
    throw redirect("/volunteer-agreement");
  }

  const profilePicturePath = user?.profilePicturePath
    ? getUserProfilePictureUrl(user.profilePicturePath)
    : null;

  console.log("profilePicturePath", profilePicturePath);

  return {
    currentView: "mentor",
    isMentorAndAdmin: loggedUser.isAdmin && loggedUser.isMentor,
    userName: loggedUser.preferred_username,
    version,
    linkMappings: {},
    environment: getEnvironment(request),
    profilePicturePath,
  };
}

export default function Index({ loaderData }: Route.ComponentProps) {
  return (
    <Body {...loaderData}>
      <Outlet />
    </Body>
  );
}
