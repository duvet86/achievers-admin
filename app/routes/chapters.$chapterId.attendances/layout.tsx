import type { LoaderFunctionArgs } from "@remix-run/node";

import { redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
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

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.chapterId, "chapterId not found");

  const isUserBlocked = await isLoggedUserBlockedAsync(
    request,
    "MentorAttendancesArea",
  );

  const loggedUser = await getLoggedUserInfoAsync(request);
  const chapterId = getChapterFromAttendancesRole(loggedUser.roles);

  if (isUserBlocked || chapterId !== Number(params.chapterId)) {
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

export default function Index() {
  const { userName, environment, version } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col">
      <Navbar userName={userName} environment={environment} version={version} />

      <main className="content-main mt-16 flex flex-col p-4">
        <Outlet />
      </main>
    </div>
  );
}
