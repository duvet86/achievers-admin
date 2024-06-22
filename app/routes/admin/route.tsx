import type { LoaderFunctionArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getLoggedUserInfoAsync, version } from "~/services/.server";
import { getEnvironment } from "~/services";

import { Body } from "~/components";

export async function loader({ request }: LoaderFunctionArgs) {
  const loggedUser = await getLoggedUserInfoAsync(request);

  return json({
    isAdmin: true,
    environment: getEnvironment(request),
    userName: loggedUser.preferred_username,
    version,
  });
}

export default function AppLayout() {
  const loaderData = useLoaderData<typeof loader>();

  return <Body {...loaderData} />;
}
