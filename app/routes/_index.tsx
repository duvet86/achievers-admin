import type { LoaderArgs } from "@remix-run/node";

import { redirect } from "@remix-run/node";
import { Roles } from "~/models/azure.server";

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

  return null;
}

export default function Index() {
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
      <div className="mt-4 flex h-full flex-col items-center items-center justify-between">
        <form action="/auth/microsoft" method="post">
          <button className="btn-primary btn mt-8 w-48 uppercase">Login</button>
        </form>

        <a
          className="mt-16 mb-8 font-medium underline underline-offset-4"
          href="https://github.com/duvet86"
        >
          Made By Luca with &#x2764;
        </a>
      </div>
    </main>
  );
}
