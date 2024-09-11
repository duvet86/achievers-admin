import type { LoaderFunctionArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import {
  getLoggedUserInfoAsync,
  getPermissionsAbility,
  trackException,
  version,
} from "~/services/.server";
import { getEnvironment } from "~/services";

import { Body } from "~/components";

export async function loader({ request }: LoaderFunctionArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);

  if (!loggedUser.isAdmin) {
    trackException(
      new Error(
        `Request url: ${request.url}. loggedUser is not ADMIN: ${JSON.stringify(loggedUser)}`,
      ),
    );
    throw redirect("/403");
  }

  const ability = getPermissionsAbility(loggedUser.roles);

  const linkMappings = {
    User: ability.can("manage", "UserArea"),
    Student: ability.can("manage", "StudentArea"),
    Session: ability.can("manage", "SessionArea"),
    Chapter: ability.can("manage", "ChapterArea"),
    SchoolTerm: ability.can("manage", "SchoolTermArea"),
    Config: ability.can("manage", "ConfigArea"),
  };

  return json({
    currentView: "admin",
    isMentorAndAdmin: loggedUser.isAdmin && loggedUser.isMentor,
    linkMappings,
    environment: getEnvironment(request),
    userName: loggedUser.preferred_username,
    version,
  });
}

export default function AppLayout() {
  const loaderData = useLoaderData<typeof loader>();

  return <Body {...loaderData} />;
}
