import type { LoaderFunctionArgs } from "react-router";

import { redirect } from "react-router";
import { Outlet, useLoaderData } from "react-router";

import { getEnvironment } from "~/services";
import {
  getLoggedUserInfoAsync,
  trackException,
  version,
} from "~/services/.server";
import { Body } from "~/components";

import { getUserByAzureADIdAsync } from "./services.server";

export async function loader({ request }: LoaderFunctionArgs) {
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
  if (user.volunteerAgreementSignedOn === null) {
    throw redirect("/volunteer-agreement");
  }

  return {
    currentView: "mentor",
    isMentorAndAdmin: loggedUser.isAdmin && loggedUser.isMentor,
    userName: loggedUser.preferred_username,
    version,
    linkMappings: {},
    environment: getEnvironment(request),
  };
}

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <Body {...loaderData}>
      <Outlet />
    </Body>
  );
}
