import type { LoaderFunctionArgs } from "@remix-run/node";

import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";

import { getSessionError_dev } from "~/services/session-dev.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const error = await getSessionError_dev(request);

  return json({ error });
}

export default function Index() {
  const { error } = useLoaderData<typeof loader>();

  console.error(error);

  if (error) {
    return <div>{JSON.stringify(error, null, 2)}</div>;
  }

  return <div>No error</div>;
}
