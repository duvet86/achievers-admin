import type { LoaderArgs } from "@remix-run/node";

import { redirect } from "@remix-run/node";

import {
  authenticator,
  getSessionUserAsync,
  getAzureUserWithRolesByIdAsync,
  Roles,
  getUserByAzureADIdAsync,
} from "~/services";

export async function loader({ request }: LoaderArgs) {
  const isAuthenticated = await authenticator.isAuthenticated(request);

  if (!isAuthenticated) {
    return await authenticator.logout(request, { redirectTo: "/auth/microsoft" });
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

  const { volunteerAgreement } = await getUserByAzureADIdAsync(
    sessionUser.azureADId
  );

  if (volunteerAgreement === null) {
    return redirect("/volunteer-agreement");
  }

  if (userRoles.includes(Roles.Mentor)) {
    return redirect("/roster");
  }

  throw redirect("/error");
}
