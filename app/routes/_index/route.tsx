import type { LoaderFunctionArgs } from "@remix-run/node";

import { redirect } from "@remix-run/node";

import {
  getAzureUserWithRolesByIdAsync,
  ROLES,
  getUserByAzureADIdAsync,
  getCurrentUserADIdAsync,
} from "~/services/.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const userAzureId = await getCurrentUserADIdAsync(request);
  const azureUser = await getAzureUserWithRolesByIdAsync(request, userAzureId);

  const userRoles = azureUser.appRoleAssignments.map(
    ({ appRoleId }) => appRoleId,
  );

  if (userRoles.includes(ROLES.Admin)) {
    return redirect("/admin/home");
  }

  const { volunteerAgreementSignedOn } =
    await getUserByAzureADIdAsync(userAzureId);

  if (volunteerAgreementSignedOn === null) {
    return redirect("/mentor/volunteer-agreement");
  }

  if (userRoles.includes(ROLES.Mentor)) {
    return redirect("/mentor/home");
  }

  throw redirect("/401");
}
