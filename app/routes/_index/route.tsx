import type { LoaderFunctionArgs } from "@remix-run/node";

import { redirect } from "@remix-run/node";

import {
  getUserByAzureADIdAsync,
  getLoggedUserInfoAsync,
} from "~/services/.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);

  if (!loggedUser.roles) {
    throw redirect("/401");
  }

  if (loggedUser.roles.findIndex((role) => role.includes("Admin")) !== -1) {
    return redirect("/admin/home");
  }

  const { volunteerAgreementSignedOn } = await getUserByAzureADIdAsync(
    loggedUser.oid,
  );

  if (volunteerAgreementSignedOn === null) {
    return redirect("/mentor/volunteer-agreement");
  }

  if (loggedUser.roles.includes("Mentor")) {
    return redirect("/mentor/home");
  }

  throw redirect("/401");
}
