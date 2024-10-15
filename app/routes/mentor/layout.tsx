import type { LoaderFunctionArgs } from "@remix-run/node";

import { redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";

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
    return redirect("/volunteer-agreement");
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
