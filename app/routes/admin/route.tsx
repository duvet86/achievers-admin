import type { LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import {
  getLoggedUserInfoAsync,
  getPermissionsAbility,
  version,
} from "~/services/.server";
import { getEnvironment } from "~/services";

import { Body } from "~/components";

export async function loader({ request }: LoaderFunctionArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);

  const ability = getPermissionsAbility(loggedUser.roles);

  const linkMappings = {
    User: ability.can("manage", "User"),
    Student: ability.can("manage", "Student"),
    Session: ability.can("manage", "Session"),
    Chapter: ability.can("manage", "Chapter"),
    SchoolTerm: ability.can("manage", "SchoolTerm"),
    Config: ability.can("manage", "Config"),
  };

  return json({
    isAdmin: true,
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
