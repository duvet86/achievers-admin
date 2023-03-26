import type { LoaderArgs } from "@remix-run/node";

import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import {
  getSessionUserAsync,
  getAzureUserWithRolesByIdAsync,
  Roles,
  version,
} from "~/services";

import { Body } from "~/components";

export async function loader({ request }: LoaderArgs) {
  const sessionUser = await getSessionUserAsync(request);

  const azureUser = await getAzureUserWithRolesByIdAsync(
    sessionUser.accessToken,
    sessionUser.userId
  );

  const sessionUserRoles = azureUser.appRoleAssignments.map(
    ({ appRoleId }) => appRoleId
  );

  const isMentor = sessionUserRoles.includes(Roles.Mentor);

  if (!isMentor) {
    throw redirect("/401");
  }

  return json({
    isAdmin: false,
    currentUser: azureUser,
    version,
  });
}

export default function AppLayout() {
  const loaderData = useLoaderData<typeof loader>();

  return <Body {...loaderData} />;
}
