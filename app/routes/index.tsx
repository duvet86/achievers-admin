import type { LoaderArgs } from "@remix-run/node";

import { json, redirect } from "@remix-run/node";

import { getSessionUserId } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const userSession = await getSessionUserId(request);

  if (userSession !== undefined) {
    return redirect("/chapters");
  }

  return json({ ok: true });
}

export default function Index() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl pt-8">
        <div className="rounded-2xl shadow-xl">
          <img
            className="w-full rounded-t-2xl object-cover"
            src="./images/header.jpeg"
            alt="Header"
          />
          <h1 className="mt-8 text-center text-6xl font-extrabold tracking-tight">
            <span className="block uppercase text-blue-500 drop-shadow-md">
              Achievers Admin
            </span>
          </h1>
          <div className="mt-4 flex flex-col items-center items-center justify-center justify-center">
            <form action="/auth/microsoft" method="post">
              <button className="mt-8 w-48 rounded-md bg-yellow-500 px-4 py-3 font-medium text-white hover:bg-yellow-600">
                Login
              </button>
            </form>

            <a
              className="mt-16 mb-8 font-medium underline underline-offset-4"
              href="https://www.achieversclubwa.org.au/"
            >
              Achievers Web Site
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
