import type { Route } from "./+types/layout";

import { Outlet, redirect } from "react-router";
import invariant from "tiny-invariant";

import { getEnvironment } from "~/services";
import {
  getChapterFromAttendancesRole,
  getLoggedUserInfoAsync,
  isLoggedUserBlockedAsync,
  trackException,
  version,
} from "~/services/.server";
import { Navbar } from "~/components";

export async function loader({ request, params }: Route.LoaderArgs) {
  invariant(params.chapterId, "chapterId not found");

  const isUserBlocked = await isLoggedUserBlockedAsync(
    request,
    "MentorAttendancesArea",
  );

  const loggedUser = await getLoggedUserInfoAsync(request);
  const chapterId = getChapterFromAttendancesRole(loggedUser.roles);

  if (
    isUserBlocked ||
    chapterId === null ||
    chapterId !== Number(params.chapterId)
  ) {
    trackException(
      new Error(
        `Request url: ${request.url}. loggedUser has no MentorAttendancesArea permissions.`,
      ),
    );
    throw redirect("/403");
  }

  return {
    currentView: "admin",
    isMentorAndAdmin: false,
    userName: loggedUser.preferred_username,
    version,
    linkMappings: {},
    environment: getEnvironment(request),
  };
}

export default function Index({
  loaderData: { userName, environment, version },
}: Route.ComponentProps) {
  return (
    <div className="flex flex-col">
      <Navbar userName={userName} environment={environment} version={version} />

      <main className="content-main mt-16 flex flex-col p-4">
        <Outlet />
      </main>
    </div>
  );
}
