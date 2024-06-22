import type { LoaderFunctionArgs } from "@remix-run/node";

import { redirect, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getEnvironment } from "~/services";
import { getLoggedUserInfoAsync, version } from "~/services/.server";
import { Body } from "~/components";

import { getUserByAzureADIdAsync } from "./services.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);
  const isMentor = loggedUser.roles.includes("Mentor");

  if (!isMentor) {
    throw redirect("/403");
  }

  const user = await getUserByAzureADIdAsync(loggedUser.oid);

  return json({
    isAdmin: false,
    hasCompletedVolunteerAgreement: user.volunteerAgreementSignedOn !== null,
    userName: loggedUser.preferred_username,
    version,
    environment: getEnvironment(request),
  });
}

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();

  return <Body {...loaderData} />;
}
