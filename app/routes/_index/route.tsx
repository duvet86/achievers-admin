import type { LoaderFunctionArgs } from "@remix-run/node";

import { redirect } from "@remix-run/node";

import {
  getUserByAzureADIdAsync,
  getLoggedUserInfoAsync,
} from "~/services/.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);

  if (loggedUser.roles.includes("Admin")) {
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
