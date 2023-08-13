import type { LoaderArgs } from "@remix-run/node";

import { redirect } from "@remix-run/node";

import {
  getAzureUserWithRolesByIdAsync,
  Roles,
  getUserByAzureADIdAsync,
  getCurrentUserADIdAsync,
} from "~/services";

export async function loader({ request }: LoaderArgs) {
  const userAzureId = await getCurrentUserADIdAsync(request);

  const azureUser = await getAzureUserWithRolesByIdAsync(request, userAzureId);

  const userRoles = azureUser.appRoleAssignments.map(
    ({ appRoleId }) => appRoleId,
  );

  if (userRoles.includes(Roles.Admin)) {
    return redirect("/users");
  }

  const { volunteerAgreementSignedOn } = await getUserByAzureADIdAsync(
    userAzureId,
  );

  if (volunteerAgreementSignedOn === null) {
    return redirect("/volunteer-agreement");
  }

  if (userRoles.includes(Roles.Mentor)) {
    return redirect("/roster");
  }

  throw redirect("/401");
}
