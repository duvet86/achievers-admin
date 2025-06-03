import type { Route } from "./+types/route";

import { redirect } from "react-router";

import {
  getChapterFromAttendancesRole,
  getLoggedUserInfoAsync,
  trackException,
} from "~/services/.server";

import { getUserByAzureADIdAsync } from "./services.server";

export async function loader({ request }: Route.LoaderArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);

  if (loggedUser.isAttendances) {
    const chapterId = getChapterFromAttendancesRole(loggedUser.roles);
    return redirect(`/chapters/${chapterId}/attendances`);
  }

  const url = new URL(request.url);

  if (loggedUser.isAdmin) {
    const returnTo = url.searchParams.get("post_login_redirect_uri");

    return redirect(returnTo ?? "/admin/home");
  }

  const { volunteerAgreementSignedOn } = await getUserByAzureADIdAsync(
    loggedUser.oid,
  );

  if (loggedUser.isMentor && volunteerAgreementSignedOn === null) {
    return redirect("/volunteer-agreement");
  }

  if (loggedUser.isMentor) {
    const returnTo = url.searchParams.get("post_login_redirect_uri");

    return redirect(returnTo ?? "/mentor/home");
  }

  trackException(
    new Error(
      `Request url: ${request.url}. loggedUser: ${JSON.stringify(loggedUser)}`,
    ),
  );

  throw redirect("/403");
}
