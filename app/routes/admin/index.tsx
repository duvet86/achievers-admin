import type { LoaderFunctionArgs } from "@remix-run/node";

import { redirect, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import {
  getAzureUserWithRolesByIdAsync,
  getCurrentUserADIdAsync,
  Roles,
  version,
  getEnvironment,
} from "~/services";

import { Body } from "~/components";

export async function loader({ request }: LoaderFunctionArgs) {
  const currentAzureUserId = await getCurrentUserADIdAsync(request);

  const azureUser = await getAzureUserWithRolesByIdAsync(
    request,
    currentAzureUserId,
  );

  const sessionUserRoles = azureUser.appRoleAssignments.map(
    ({ appRoleId }) => appRoleId,
  );

  const isAdmin = sessionUserRoles.includes(Roles.Admin);

  if (!isAdmin) {
    throw redirect("/401");
  }

  return json({
    isAdmin: true,
    environment: getEnvironment(request),
    currentUser: azureUser,
    version,
  });
}

export default function AppLayout() {
  const loaderData = useLoaderData<typeof loader>();

  return <Body {...loaderData} />;
}
