import type { LoaderFunctionArgs } from "@remix-run/node";

import { redirect } from "@remix-run/node";

import { getLoggedUserInfoAsync } from "~/services/.server";

import { getUserByAzureADIdAsync } from "./services.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);

  if (loggedUser.isAdmin) {
    return redirect("/admin/home");
  }

  const { volunteerAgreementSignedOn } = await getUserByAzureADIdAsync(
    loggedUser.oid,
  );

  if (loggedUser.isMentor && volunteerAgreementSignedOn === null) {
    return redirect("/volunteer-agreement");
  }

  if (loggedUser.isMentor) {
    return redirect("/mentor/home");
  }

  throw redirect("/403");
}
