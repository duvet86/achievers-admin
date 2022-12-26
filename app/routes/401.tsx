import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { Link } from "@remix-run/react";

export default function Forbidden() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl pt-8">
        <div className="flex flex-col items-center justify-center rounded-2xl shadow-xl">
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
          <h1 className="mt-4 flex h-40 items-center justify-center text-center text-4xl font-extrabold tracking-tight">
            <ExclamationTriangleIcon className="mr-4 w-24 text-red-500" />
            <span className="block uppercase text-red-500 drop-shadow-md">
              You have no permissions
            </span>
          </h1>
          <div className="pb-8">
            <Link
              to="/logout"
              className="mt-4 rounded border border-white bg-blue-500 px-4 py-2 text-white hover:border-transparent hover:bg-blue-600"
            >
              Logout
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
