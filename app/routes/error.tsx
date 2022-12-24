import { useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";

import { json } from "@remix-run/server-runtime";

import { authenticator, getSession } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request);
  const error = session.get(authenticator.sessionErrorKey);

  return json({ error });
}

export default function Error() {
  const data = useLoaderData();

  console.log(data);

  return <div>{JSON.stringify(data, null, 2)}</div>;
}
