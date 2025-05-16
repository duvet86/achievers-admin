import type { Route } from "./+types/layout";

import { redirect } from "react-router";
import { Outlet } from "react-router";

import {
  getLoggedUserInfoAsync,
  getPermissionsAbility,
  trackException,
  version,
} from "~/services/.server";
import { getEnvironment } from "~/services";

import { Body } from "~/components";

export async function loader({ request }: Route.LoaderArgs) {
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
    Permissions: ability.can("manage", "PermissionsArea"),
    Goals: ability.can("manage", "GoalsArea"),
  };

  return {
    currentView: "admin",
    isMentorAndAdmin: loggedUser.isAdmin && loggedUser.isMentor,
    linkMappings,
    environment: getEnvironment(request),
    userName: loggedUser.preferred_username,
    version,
  };
}

export default function AppLayout({ loaderData }: Route.ComponentProps) {
  return (
    <Body {...loaderData}>
      <Outlet />
    </Body>
  );
}
