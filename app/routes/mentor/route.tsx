import type { LoaderFunctionArgs } from "@remix-run/node";

import { redirect, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getEnvironment } from "~/services";
import { getLoggedUserInfoAsync, version } from "~/services/.server";
import { Body } from "~/components";

import { getUserByAzureADIdAsync } from "./services.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);

  if (!loggedUser.isMentor) {
    throw redirect("/403");
  }

  const user = await getUserByAzureADIdAsync(loggedUser.oid);
  if (user.volunteerAgreementSignedOn === null) {
    return redirect("/volunteer-agreement");
  }

  return json({
    currentView: "mentor",
    isMentorAndAdmin: loggedUser.isAdmin && loggedUser.isMentor,
    userName: loggedUser.preferred_username,
    version,
    linkMappings: {},
    environment: getEnvironment(request),
  });
}

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();

  return <Body {...loaderData} />;
}
