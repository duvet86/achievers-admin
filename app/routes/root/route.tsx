import type { LoaderFunctionArgs } from "react-router";

import { redirect } from "react-router";

import {
  getChapterFromAttendancesRole,
  getLoggedUserInfoAsync,
  trackException,
} from "~/services/.server";

import { getUserByAzureADIdAsync } from "./services.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);

  if (loggedUser.isAttendances) {
    const chapterId = getChapterFromAttendancesRole(loggedUser.roles);
    return redirect(`/chapters/${chapterId}/attendances`);
  }

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

  trackException(
    new Error(
      `Request url: ${request.url}. loggedUser: ${JSON.stringify(loggedUser)}`,
    ),
  );

  throw redirect("/403");
}
