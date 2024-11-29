import type { LoaderFunctionArgs } from "react-router";

import { redirect } from "react-router";
import { Outlet, useLoaderData } from "react-router";

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
    Permissions: ability.can("manage", "PermissionsArea"),
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

export default function AppLayout() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <Body {...loaderData}>
      <Outlet />
    </Body>
  );
}
