import type { LoaderArgs } from "@remix-run/node";

import { redirect } from "@remix-run/node";

import {
  authenticator,
  getSessionUserAsync,
  getAzureUserWithRolesByIdAsync,
  Roles,
} from "~/services";

export async function loader({ request }: LoaderArgs) {
  const isAuthenticated = await authenticator.isAuthenticated(request);

  if (!isAuthenticated) {
    return redirect("/auth/microsoft");
  }

  const sessionUser = await getSessionUserAsync(request);

  const azureUser = await getAzureUserWithRolesByIdAsync(
    sessionUser.accessToken,
    sessionUser.azureADId
  );

  const userRoles = azureUser.appRoleAssignments.map(
    ({ appRoleId }) => appRoleId
  );

  if (userRoles.includes(Roles.Admin)) {
    return redirect("/users");
  }

  if (userRoles.includes(Roles.Mentor)) {
    return redirect("/roster");
  }

  throw redirect("/401");
}
