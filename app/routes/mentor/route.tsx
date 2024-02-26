import type { LoaderFunctionArgs } from "@remix-run/node";

import { redirect, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getEnvironment } from "~/services";
import {
  Roles,
  getAzureUserWithRolesByIdAsync,
  getCurrentUserADIdAsync,
  getUserByAzureADIdAsync,
  version,
} from "~/services/.server";

import { Body } from "~/components";

export async function loader({ request }: LoaderFunctionArgs) {
  const azureUserId = await getCurrentUserADIdAsync(request);

  const azureUser = await getAzureUserWithRolesByIdAsync(request, azureUserId);

  const sessionUserRoles = azureUser.appRoleAssignments.map(
    ({ appRoleId }) => appRoleId,
  );

  const isMentor = sessionUserRoles.includes(Roles.Mentor);

  if (!isMentor) {
    throw redirect("/401");
  }

  const user = await getUserByAzureADIdAsync(azureUserId);

  return json({
    isAdmin: false,
    hasCompletedVolunteerAgreement: user.volunteerAgreementSignedOn !== null,
    currentUser: azureUser,
    version,
    environment: getEnvironment(request),
  });
}

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();

  return <Body {...loaderData} />;
}
