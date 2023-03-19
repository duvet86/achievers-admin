import type { LoaderArgs } from "@remix-run/node";

import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";

import { getSessionError } from "~/services";

export async function loader({ request }: LoaderArgs) {
  const error = await getSessionError(request);

  return json({ error });
}

export default function Error() {
  const data = useLoaderData();

  console.error(data);

  return <div>{JSON.stringify(data, null, 2)}</div>;
}
