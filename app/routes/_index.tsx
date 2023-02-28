import type { LoaderArgs } from "@remix-run/node";

import { redirect, json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import { Roles } from "~/services/azure.server";
import { version } from "~/services/version.server";
import { getSessionUserAsync } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const sessionUser = await getSessionUserAsync(request);

  const userRoles = sessionUser?.appRoleAssignments.map(
    ({ appRoleId }) => appRoleId
  );

  if (userRoles?.includes(Roles.Admin)) {
    return redirect("/users");
  }

  if (userRoles?.includes(Roles.Mentor)) {
    return redirect("/roster");
  }

  return json({
    version,
  });
}

export default function Index() {
  const { version } = useLoaderData<typeof loader>();

  return (
    <main className="flex h-full flex-col bg-white">
      <img
        className="w-full object-cover lg:h-48"
        src="./images/header.jpeg"
        alt="Header"
      />
      <h1 className="mt-8 text-center text-6xl font-extrabold tracking-tight">
        <span className="block uppercase text-blue-500 drop-shadow-md">
          Achievers Admin
        </span>
      </h1>
      <div className="mt-4 flex h-full flex-col items-center justify-between">
        <Form action="/auth/microsoft" method="post">
          <button type="submit" className="btn-primary btn mt-8 w-48 uppercase">
            Login
          </button>
        </Form>

        <div className="text-center">
          <a
            className="mt-16 mb-8 text-xs font-medium underline underline-offset-4"
            href="https://github.com/duvet86"
          >
            Made with &#x2764; by Luca
          </a>

          <p className="text-xs">Version {version}</p>
        </div>
      </div>
    </main>
  );
}
