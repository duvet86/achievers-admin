import type { LoaderArgs } from "@remix-run/node";

import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import {
  getAzureUserWithRolesByIdAsync,
  getCurrentUserADIdAsync,
  Roles,
  version,
} from "~/services";

import { Body } from "~/components";

export async function loader({ request }: LoaderArgs) {
  const currentAzureUserId = await getCurrentUserADIdAsync(request);

  const azureUser = await getAzureUserWithRolesByIdAsync(
    request,
    currentAzureUserId
  );

  const sessionUserRoles = azureUser.appRoleAssignments.map(
    ({ appRoleId }) => appRoleId
  );

  const isAdmin = sessionUserRoles.includes(Roles.Admin);

  if (!isAdmin) {
    throw redirect("/401");
  }

  return json({
    isAdmin: true,
    currentUser: azureUser,
    version,
  });
}

export default function AppLayout() {
  const loaderData = useLoaderData<typeof loader>();

  return <Body {...loaderData} />;
}
